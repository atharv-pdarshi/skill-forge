// backend/controllers/bookingController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendEmail } = require('../utils/emailService');

// For create a new Booking Request
const createBooking = async (req, res) => {
  try {
    const { skillId, bookingTime, message } = req.body;
    const studentId = req.user.user_id; 

    if (!skillId || !bookingTime) {
      return res.status(400).json({ message: 'Skill ID and booking time are required' });
    }

    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
      include: { 
        user: true // To get provider details
      } 
    });

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    if (skill.userId === studentId) {
        return res.status(400).json({ message: 'You cannot book your own skill' });
    }

    // ADDED: Check for existing active (pending or confirmed) booking by this student for this skill
    const existingActiveBooking = await prisma.booking.findFirst({
        where: {
            skillId: skillId,
            studentId: studentId,
            status: {
                in: ['pending', 'confirmed'] // Check for these statuses
            }
        }
    });

    if (existingActiveBooking) {
        return res.status(409).json({ message: 'You already have an active or pending booking request for this skill.' });
    }
    // END OF ADDED CHECK
    
    const provider = skill.user;
    const providerId = provider.id;

    const newBooking = await prisma.booking.create({
      data: {
        bookingTime: new Date(bookingTime), 
        message,
        skillId,
        studentId,
        providerId, // This is skill.userId
        status: 'pending', // Default status from schema
        // providerMessageOnConfirm will be null by default
      },
      include: {
        skill: { select: { id: true, title: true } },
        student: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } }, // This is essentially skill.user
      }
    });

    // Sending notification email to the skill provider
    if (provider && provider.email) {
      const subject = `New Booking Request for your skill: ${skill.title}`;
      const studentInfo = newBooking.student; // studentInfo from the created booking
      const htmlContent = `
        <p>Hi ${provider.name || 'Provider'},</p>
        <p>${studentInfo.name || 'A student'} (${studentInfo.email}) has requested to book your skill "${skill.title}"
           for ${new Date(newBooking.bookingTime).toLocaleString()}.</p>
        <p>Message from student: ${newBooking.message || 'N/A'}</p>
        <p>Please log in to SkillForge to review this request.</p>
      `;
      try {
        await sendEmail(provider.email, subject, htmlContent);
      } catch (emailError) {
        console.error("Failed to send booking creation email, but booking was created:", emailError);
      }
    }

    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Failed to create booking', error: error.message });
  }
};

// Get bookings made by the logged-in student
const getStudentBookings = async (req, res) => {
  try {
    const studentId = req.user.user_id;
    const bookings = await prisma.booking.findMany({
      where: { studentId: studentId },
      include: {
        skill: { select: { id: true, title: true, category: true } },
        provider: { select: { id: true, name: true } } 
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching student bookings:', error);
    res.status(500).json({ message: 'Failed to fetch student bookings', error: error.message });
  }
};

// For getting bookings received by the logged-in provider (for their skills)
const getProviderBookings = async (req, res) => {
  try {
    const providerId = req.user.user_id;
    const bookings = await prisma.booking.findMany({
      where: { providerId: providerId }, 
      include: {
        skill: { select: { id: true, title: true } },
        student: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching provider bookings:', error);
    res.status(500).json({ message: 'Failed to fetch provider bookings', error: error.message });
  }
};

// For updating Booking Status
const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status, providerMessageOnConfirm } = req.body; 
        const currentUserId = req.user.user_id;

        if (!status) {
            return res.status(400).json({ message: "New status is required" });
        }

        const validStatuses = ["pending", "confirmed", "completed", "cancelled_by_student", "cancelled_by_provider"];
        if (!validStatuses.includes(status.toLowerCase())) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { 
                skill: { include: { user: true } }, 
                student: true 
            }
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        let canUpdate = false;
        const provider = booking.skill.user; 
        const student = booking.student;     

        if (provider.id === currentUserId) {
            if (["confirmed", "completed", "cancelled_by_provider"].includes(status.toLowerCase())) {
                canUpdate = true;
            }
        } else if (student.id === currentUserId) {
            if (status.toLowerCase() === "cancelled_by_student" && (booking.status === "pending" || booking.status === "confirmed")) {
                canUpdate = true;
            }
        }

        if (!canUpdate) {
            return res.status(403).json({ message: "Forbidden: You do not have permission to update this booking to the specified status." });
        }

        const updateData = { status: status.toLowerCase() };
        if (status.toLowerCase() === 'confirmed' && providerMessageOnConfirm !== undefined && provider.id === currentUserId) {
            updateData.providerMessageOnConfirm = providerMessageOnConfirm;
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: updateData,
            include: {
                skill: { select: { id: true, title: true } },
                student: { select: { id: true, name: true, email: true } },
                provider: {select: {id: true, name: true, email: true}}
            }
        });

        let emailRecipient = null;
        let emailSubject = '';
        let emailHtmlContent = '';

        if (provider && student) {
            if (status.toLowerCase() === 'confirmed' && student.email) {
                emailRecipient = student.email;
                emailSubject = `Your booking for "${updatedBooking.skill.title}" has been confirmed!`;
                emailHtmlContent = `
                    <p>Hi ${student.name || 'Student'},</p>
                    <p>Your booking for the skill "${updatedBooking.skill.title}" with ${provider.name || 'the provider'}
                       scheduled for ${new Date(updatedBooking.bookingTime).toLocaleString()} has been confirmed.</p>
                    ${updatedBooking.providerMessageOnConfirm
                        ? `<p><strong>Message from your provider:</strong></p><p style="padding: 10px; border: 1px solid #dddddd; background-color: #f9f9f9; border-radius: 4px;">${updatedBooking.providerMessageOnConfirm.replace(/\n/g, '<br>')}</p>`
                        : ''
                    }
                    <p>Please contact your provider if you have any questions.</p>
                    <p>We look forward to your session!</p>
                `;
            } else if (status.toLowerCase() === 'cancelled_by_provider' && student.email) {
                emailRecipient = student.email;
                emailSubject = `Your booking for "${booking.skill.title}" has been cancelled by the provider.`;
                emailHtmlContent = `
                    <p>Hi ${student.name || 'Student'},</p>
                    <p>We regret to inform you that your booking for "${booking.skill.title}"
                       scheduled for ${new Date(booking.bookingTime).toLocaleString()} has been cancelled by the provider.</p>
                    <p>Provider: ${provider.name || 'N/A'}</p>
                `;
            } else if (status.toLowerCase() === 'cancelled_by_student' && provider.email) {
                 emailRecipient = provider.email;
                 emailSubject = `A booking for your skill "${booking.skill.title}" has been cancelled by the student.`;
                 emailHtmlContent = `
                    <p>Hi ${provider.name || 'Provider'},</p>
                    <p>The booking made by ${student.name || 'the student'} (${student.email || 'N/A'}) for your skill "${booking.skill.title}"
                       scheduled for ${new Date(booking.bookingTime).toLocaleString()} has been cancelled by the student.</p>
                 `;
            }
        }

        if (emailRecipient && emailSubject && emailHtmlContent) {
            try {
                await sendEmail(emailRecipient, emailSubject, emailHtmlContent);
            } catch (emailError) {
                console.error("Failed to send booking status update email, but status was updated:", emailError);
            }
        }
        res.status(200).json(updatedBooking);
    } catch (error) {
        console.error("Error updating booking status:", error);
        res.status(500).json({ message: "Failed to update booking status", error: error.message });
    }
};

module.exports = {
  createBooking,
  getStudentBookings,
  getProviderBookings,
  updateBookingStatus,
};