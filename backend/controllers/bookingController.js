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

    // Find the skill to ensure it exists and to get the provider (user who owns the skill)
    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
      include: { 
        user: true
      } 
    });

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    if (skill.userId === studentId) {
        return res.status(400).json({ message: 'You cannot book your own skill' });
    }
    
    const provider = skill.user;
    const providerId = provider.id;

    const newBooking = await prisma.booking.create({
      data: {
        bookingTime: new Date(bookingTime), 
        message,
        skillId,
        studentId,
        providerId,
        status: 'pending', // Initial status is kept as pending by default
      },
      include: { // Including related data in the response for the API client
        skill: { select: { id: true, title: true } },
        student: { select: { id: true, name: true, email: true } }, // Student who made the booking
        provider: { select: { id: true, name: true, email: true } }, // Provider of the skill
      }
    });

    // Sending notification email to the skill provider
    if (provider && provider.email) {
      const subject = `New Booking Request for your skill: ${skill.title}`;
      const studentInfo = newBooking.student;
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
        provider: { select: { id: true, name: true } } // Provider of the skill
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
        student: { select: { id: true, name: true, email: true } } // Student who made the booking
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
        const { status } = req.body; 
        const currentUserId = req.user.user_id;

        if (!status) {
            return res.status(400).json({ message: "New status is required" });
        }

        const validStatuses = ["pending", "confirmed", "completed", "cancelled_by_student", "cancelled_by_provider"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { 
                skill: { include: { user: true } }, // To get provider (skill.user)
                student: true // To get student
            }
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        let canUpdate = false;
        const provider = booking.skill.user; // The provider User object
        const student = booking.student;     // The student User object

        if (provider.id === currentUserId) { // User is the provider
            if (["confirmed", "completed", "cancelled_by_provider"].includes(status)) {
                canUpdate = true;
            }
        } else if (student.id === currentUserId) { // User is the student
            if (status === "cancelled_by_student" && (booking.status === "pending" || booking.status === "confirmed")) {
                canUpdate = true;
            }
        }

        if (!canUpdate) {
            return res.status(403).json({ message: "Forbidden: You do not have permission to update this booking to the specified status." });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { status: status },
            include: {
                skill: { select: { id: true, title: true } },
                student: { select: { id: true, name: true, email: true } },
                provider: {select: {id: true, name: true, email: true}}
            }
        });

        // For sending notification email based on status change
        let emailRecipient = null;
        let emailSubject = '';
        let emailHtmlContent = '';

        // For ensuring provider and student objects (and their emails) are available
        if (provider && student) {
            if (status === 'confirmed' && student.email) {
                emailRecipient = student.email;
                emailSubject = `Your booking for "${booking.skill.title}" has been confirmed!`;
                emailHtmlContent = `
                    <p>Hi ${student.name || 'Student'},</p>
                    <p>Your booking for the skill "${booking.skill.title}" with ${provider.name || 'the provider'}
                       scheduled for ${new Date(booking.bookingTime).toLocaleString()} has been confirmed.</p>
                    <p>We look forward to your session!</p>
                `;
            } else if (status === 'cancelled_by_provider' && student.email) {
                emailRecipient = student.email;
                emailSubject = `Your booking for "${booking.skill.title}" has been cancelled by the provider.`;
                emailHtmlContent = `
                    <p>Hi ${student.name || 'Student'},</p>
                    <p>We regret to inform you that your booking for "${booking.skill.title}"
                       scheduled for ${new Date(booking.bookingTime).toLocaleString()} has been cancelled by the provider.</p>
                    <p>Provider: ${provider.name || 'N/A'}</p>
                `;
            } else if (status === 'cancelled_by_student' && provider.email) {
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