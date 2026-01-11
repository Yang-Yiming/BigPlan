# BigPlans User Manual

Complete guide for using BigPlans to manage tasks, track progress, and collaborate with your team.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Account Management](#account-management)
3. [Task Management](#task-management)
4. [KISS Reflections](#kiss-reflections)
5. [Team Collaboration](#team-collaboration)
6. [Comments and Feedback](#comments-and-feedback)
7. [Tips and Best Practices](#tips-and-best-practices)
8. [Keyboard Shortcuts](#keyboard-shortcuts)
9. [FAQ](#faq)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### What is BigPlans?

BigPlans is a productivity application that combines:
- **Daily task tracking** with flexible progress types
- **KISS reflections** (Keep, Improve, Start, Stop) for personal growth
- **Team collaboration** to share progress and support teammates
- **Commenting system** for feedback and discussion

### Creating Your Account

1. **Visit the application** (e.g., http://localhost:5173 for local, or your production URL)

2. **Click "Register"** on the login page

3. **Enter your details:**
   - **Username:** 3-20 characters, unique, alphanumeric
   - **Password:** Minimum 6 characters

4. **Click "Create Account"**

5. **You're in!** You'll be automatically logged in

### Logging In

1. **Enter your username and password**
2. **Click "Login"**
3. Your session lasts 7 days before requiring re-login

### Your First Day

Once logged in, you'll see:
- **Today's date** at the top
- **Empty task list** (ready for your first task)
- **Navigation bar** with options
- **KISS reflection section** (unlocks when you complete 3 tasks)

---

## Account Management

### Updating Your Profile

**Avatar:**
Currently, avatars are set via URL. In a future update, you'll be able to upload images.

### Changing Password

Currently managed through re-registration. Future update will include password change functionality.

### Logging Out

1. **Click your username** in the top navigation bar
2. **Select "Logout"**
3. You'll be redirected to the login page

---

## Task Management

### Creating a Task

1. **Click "+ New Task"** button

2. **Fill in the form:**
   - **Title** (required): Brief description of the task
   - **Description** (optional): Additional details
   - **Date** (required): When you plan to do this task
   - **Progress Type:** Choose one:
     - **Boolean:** Simple done/not done (default)
     - **Numeric:** Count-based (e.g., "Read 3 of 10 chapters")
     - **Percentage:** Percentage-based (e.g., "50% complete")

3. **For numeric/percentage types:**
   - Enter **Max Progress** (e.g., 10 for "10 chapters", 100 for "100%")

4. **Click "Create Task"**

**Example Tasks:**

```
Title: "Morning workout"
Type: Boolean
→ Simple checkbox when done

Title: "Read 'Clean Code'"
Type: Numeric
Max: 464 pages
→ Track "150 / 464 pages"

Title: "Complete project proposal"
Type: Percentage
Max: 100
→ Track "75%"
```

### Editing a Task

1. **Click the task card**
2. **Modify any field:**
   - Title
   - Description
   - Progress value
   - Progress type
3. **Click "Save"**

### Tracking Progress

**Boolean tasks:**
- Click the checkbox to mark complete
- Click again to mark incomplete

**Numeric tasks:**
- Click the task
- Update the progress value
- Or use +/- buttons (if available)

**Percentage tasks:**
- Click the task
- Drag the progress slider
- Or enter a number directly

### Deleting a Task

1. **Click the task card**
2. **Click "Delete" button**
3. **Confirm deletion** in the dialog
4. Task is permanently removed

### Recurring Tasks

Create tasks that repeat daily, weekly, or monthly.

**Setting up recurring tasks:**

1. **Click "+ New Task"**
2. **Enable "Recurring"** checkbox
3. **Choose frequency:**
   - **Daily:** Every day
   - **Weekly:** Once per week
   - **Monthly:** Once per month
4. **Set interval** (e.g., "Every 2 days" or "Every 3 weeks")

**Example:**

```
Title: "Daily standup"
Recurring: Yes
Frequency: Daily
Interval: 1
→ Creates task every day

Title: "Weekly review"
Recurring: Yes
Frequency: Weekly
Interval: 1
→ Creates task every 7 days
```

**How recurring tasks work:**
- The system automatically generates task instances
- Each instance appears on its scheduled date
- Completing one instance doesn't affect future ones
- Edit the recurring pattern to change all future instances

### Viewing Tasks

**By date:**
1. **Click the date selector** at the top
2. **Choose a date** from the calendar
3. Tasks for that date appear below

**Today's tasks:**
- Click "Today" quick link
- Or select today's date manually

**Past tasks:**
- Select a past date
- View what you completed
- Reflect on your progress

**Future tasks:**
- Select a future date
- Plan ahead
- See upcoming recurring tasks

---

## KISS Reflections

### What is KISS?

KISS is a structured reflection framework with four components:

- **Keep:** What went well today? What should you continue doing?
- **Improve:** What could be better? What needs refinement?
- **Start:** What new habits or practices should you begin?
- **Stop:** What behaviors should you eliminate?

### Creating a Daily Reflection

1. **Complete at least 3 tasks** for the day (unlocks reflections)

2. **Click "Add KISS Reflection"** button

3. **Fill in each section:**
   - You can fill all four, or just the ones that apply
   - Write as much or as little as you like
   - Be honest and specific

4. **Click "Save Reflection"**

**Example:**

```
Keep:
"Focused work sessions with pomodoro timer. Great productivity!"

Improve:
"Need better time estimation - tasks took longer than expected."

Start:
"Morning planning routine before checking email."

Stop:
"Checking social media during work hours."
```

### Editing a Reflection

1. **Click "Edit Reflection"** on your existing reflection
2. **Modify any section**
3. **Click "Save"**

**Note:** You can only have one reflection per day.

### Viewing Past Reflections

1. **Select a past date**
2. **Your reflection appears** below tasks
3. **Review your journey** and track patterns

### Sharing Reflections with Groups

**Privacy setting:**
- By default, reflections are **shared** with group members
- You can **hide** them in group settings

**To hide your reflections:**
1. Go to **Group Settings**
2. Uncheck **"Show KISS reflections to group"**
3. **Save settings**

---

## Team Collaboration

### Creating a Group

1. **Click "Groups"** in the navigation

2. **Click "+ Create Group"**

3. **Enter group name** (e.g., "Development Team", "Marketing Squad")

4. **Click "Create"**

5. **Copy the invite code** (8-character alphanumeric, e.g., "ABC12XYZ")

6. **Share the code** with teammates

### Joining a Group

1. **Get the invite code** from your team leader

2. **Click "Groups"** in navigation

3. **Click "Join Group"**

4. **Enter the invite code**

5. **Click "Join"**

6. **You're in!** You can now see group members

### Viewing Group Members

1. **Go to "Groups"** page

2. **Click on a group name**

3. **See all members** with:
   - Username
   - Avatar
   - Join date
   - KISS visibility setting

### Viewing Teammate's Tasks

1. **Go to group page**

2. **Click on a teammate's avatar or name**

3. **Select a date**

4. **View their tasks** for that day
   - See task titles and progress
   - Cannot edit (view-only)
   - Can leave comments

### Viewing Teammate's KISS Reflections

1. **View teammate's tasks** (as above)

2. **Scroll to their KISS reflection** (if they have one)

**Unlock requirements:**
- You must have completed **your own reflection** for that day
- Teammate must have **"Show KISS" enabled**

**If locked:**
- You'll see a message: "Complete your own reflection to view"
- Create your reflection to unlock

### Group Settings

**Personal group settings:**

1. **Go to group page**
2. **Click "My Settings"**
3. **Toggle options:**
   - **Show KISS reflections:** Share with group or keep private

---

## Comments and Feedback

### Commenting on Tasks

**To comment on a teammate's task:**

1. **View their tasks** for a date
2. **Click on a specific task**
3. **Type your comment** in the comment box
4. **Click "Post Comment"**

**Your comment includes:**
- Your username
- Timestamp
- Comment text

**Use cases:**
- "Great progress on this!"
- "Need help with anything?"
- "I'm working on something similar"

### Daily Comments

**To leave a general comment for a teammate's day:**

1. **View their tasks** for a date
2. **Scroll to "Daily Comments" section**
3. **Type your comment**
4. **Click "Post Comment"**

**Daily comments are for:**
- Overall feedback on their day
- Encouragement
- General observations
- Not tied to a specific task

### Editing Comments

1. **Find your comment**
2. **Click "Edit"**
3. **Modify the text**
4. **Click "Save"**

**Note:** You can only edit your own comments.

### Deleting Comments

1. **Find your comment**
2. **Click "Delete"**
3. **Confirm deletion**

**Note:** You can only delete your own comments.

### Comment Etiquette

**Do:**
- Be supportive and constructive
- Celebrate wins
- Offer help when asked
- Keep it professional and friendly

**Don't:**
- Be overly critical
- Spam with too many comments
- Share sensitive information
- Use inappropriate language

---

## Tips and Best Practices

### Task Management Tips

1. **Start small**
   - 3-5 tasks per day is better than 20
   - Better to complete few tasks than leave many incomplete

2. **Use specific titles**
   - ❌ "Work on project"
   - ✅ "Write API documentation for Tasks endpoint"

3. **Choose the right progress type**
   - Use **boolean** for simple yes/no tasks
   - Use **numeric** when tracking countable items
   - Use **percentage** for gradual progress

4. **Plan ahead**
   - Create tomorrow's tasks at end of today
   - Use recurring tasks for habits

5. **Review regularly**
   - Weekly: Review past week's tasks
   - Monthly: Identify patterns and adjust

### KISS Reflection Tips

1. **Be specific**
   - ❌ "Did good work"
   - ✅ "Completed 5 code reviews with detailed feedback"

2. **Be honest**
   - Reflections are for your growth
   - Acknowledge challenges

3. **Focus on actionable items**
   - "Start waking up 30 minutes earlier" (specific)
   - vs. "Be more productive" (vague)

4. **Track patterns**
   - Review past reflections monthly
   - Notice recurring themes
   - Adjust accordingly

5. **Don't skip it**
   - Even a brief reflection is valuable
   - 2-3 sentences per section is fine

### Collaboration Tips

1. **Comment with intention**
   - Quality over quantity
   - Meaningful feedback helps

2. **Respect privacy**
   - If someone hides KISS, respect it
   - Don't pressure for details

3. **Be consistent**
   - Regular updates help team visibility
   - Complete tasks daily

4. **Support each other**
   - Acknowledge good work
   - Offer help proactively

---

## Keyboard Shortcuts

*Note: Keyboard shortcuts may vary by browser and implementation.*

### Navigation

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Quick add task |
| `Ctrl/Cmd + ,` | Open settings |
| `Esc` | Close modal/dialog |
| `Tab` | Navigate between fields |

### Task Management

| Shortcut | Action |
|----------|--------|
| `Space` | Toggle task checkbox (when focused) |
| `Enter` | Save task (in edit mode) |
| `Ctrl/Cmd + Enter` | Quick save |

### Date Navigation

| Shortcut | Action |
|----------|--------|
| `←` | Previous day |
| `→` | Next day |
| `T` | Today |

*Keyboard shortcuts enhance productivity once learned!*

---

## FAQ

### General Questions

**Q: How long does my session last?**
A: 7 days. After that, you'll need to log in again.

**Q: Can I use BigPlans on mobile?**
A: Yes! The interface is responsive and works on mobile browsers.

**Q: Is my data private?**
A: Your tasks and reflections are private unless you join a group and choose to share.

**Q: Can I export my data?**
A: Currently no built-in export. Future feature planned.

### Task Management

**Q: What happens to recurring tasks if I delete one instance?**
A: Only that instance is deleted. Future instances continue.

**Q: Can I move a task to another date?**
A: Edit the task and change the date field.

**Q: How many tasks can I create?**
A: No limit! But we recommend 3-5 per day for focus.

**Q: Can I share tasks with others?**
A: Not directly, but group members can view your tasks.

### KISS Reflections

**Q: Do I have to fill all four sections?**
A: No, fill what's relevant for the day.

**Q: Can I have multiple reflections per day?**
A: No, one reflection per day. Edit it if needed.

**Q: Why is the reflection locked?**
A: You need to complete at least 3 tasks to unlock it.

**Q: Can I see others' reflections without sharing mine?**
A: No, you must create your own reflection to view others' (unless they hide theirs).

### Groups

**Q: How many groups can I join?**
A: Unlimited.

**Q: Can I leave a group?**
A: Currently no, but you can hide your KISS reflections.

**Q: Who can see my tasks?**
A: Only members of groups you've joined.

**Q: Can group members edit my tasks?**
A: No, they can only view and comment.

### Comments

**Q: Can I delete others' comments on my tasks?**
A: Currently no, but future feature planned.

**Q: Are comments visible to all group members?**
A: Yes, all members of shared groups can see comments.

**Q: Can I attach files to comments?**
A: Not yet, text only for now.

---

## Troubleshooting

### I can't log in

**Possible causes:**
1. Wrong username or password
2. Account doesn't exist
3. Session expired

**Solutions:**
- Double-check spelling and capitalization
- Try registering if you haven't yet
- Use password manager to avoid typos

---

### Tasks aren't saving

**Possible causes:**
1. Network connection issue
2. Server error
3. Session expired

**Solutions:**
1. Check internet connection
2. Refresh the page
3. Log out and log back in
4. Check browser console for errors

---

### KISS reflection won't unlock

**Cause:** Haven't completed enough tasks

**Solution:**
- Complete at least 3 tasks for the day
- Refresh the page
- The reflection section will unlock automatically

---

### Can't see teammate's KISS

**Possible causes:**
1. They haven't created a reflection
2. They've hidden reflections in settings
3. You haven't created your own reflection

**Solutions:**
- Create your own reflection first
- Ask teammate to check their privacy settings
- Verify teammate has actually created reflection for that date

---

### Comments not appearing

**Possible causes:**
1. Network delay
2. Wrong date selected
3. Browser cache

**Solutions:**
- Refresh the page
- Verify you're looking at correct date
- Clear browser cache
- Check if comment was saved (look for success message)

---

### Recurring tasks not generating

**Possible causes:**
1. Incorrect recurrence pattern
2. System hasn't run generation yet
3. Date range issue

**Solutions:**
- Verify recurrence pattern is set correctly
- Navigate to future dates to trigger generation
- Contact administrator if persistent

---

## Getting Help

### Support Resources

1. **Documentation:** Check `/docs` directory
   - API.md - API reference
   - DEV_SETUP.md - Development setup
   - DATABASE_MIGRATION.md - Database info

2. **GitHub Issues:** Report bugs or request features

3. **Team:** Ask your group members or admin

### Reporting Issues

When reporting a problem, include:
1. What you were trying to do
2. What happened instead
3. Steps to reproduce
4. Browser and version
5. Screenshot if applicable

---

## Glossary

| Term | Definition |
|------|------------|
| **Task** | A single item to complete, with optional progress tracking |
| **KISS Reflection** | Daily reflection using Keep, Improve, Start, Stop framework |
| **Boolean Progress** | Simple done/not done checkbox |
| **Numeric Progress** | Count-based tracking (e.g., 5/10) |
| **Percentage Progress** | Percentage completion (0-100%) |
| **Recurring Task** | Task that repeats on a schedule |
| **Group** | Team or collection of users who can view each other's progress |
| **Invite Code** | 8-character code used to join a group |
| **Daily Comment** | General feedback for someone's entire day |
| **Task Comment** | Feedback on a specific task |

---

## Updates and Changes

**Version 1.0** (Current)
- Task management with 3 progress types
- KISS daily reflections
- Group collaboration
- Comments system
- Recurring tasks

**Planned features:**
- File attachments
- Task templates
- Advanced analytics
- Mobile apps
- Export functionality
- Calendar integrations

---

**Happy planning! 🎯**

Make every day count with BigPlans.
