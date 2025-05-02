"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

// Types
type User = {
  id: string
  name: string
  avatar: string
  role: string
  email: string
}

type Comment = {
  id: string
  userId: string
  text: string
  timestamp: Date
}

type Milestone = {
  id: string
  title: string
  description: string
  completed: boolean
  dueDate: Date
}

type Goal = {
  id: string
  title: string
  description: string
  progress: number
  category: string
  priority: "low" | "medium" | "high"
  dueDate: Date
  createdAt: Date
  ownerId: string
  teamMembers: string[]
  comments: Comment[]
  milestones: Milestone[]
  color: string
}

type Notification = {
  id: string
  userId: string
  message: string
  read: boolean
  timestamp: Date
  type: "comment" | "milestone" | "progress" | "mention"
}

// Mock Data
const mockUsers: User[] = [
  {
    id: "u1",
    name: "Alex Morgan",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    role: "Product Manager",
    email: "alex.morgan@example.com",
  },
  {
    id: "u2",
    name: "James Wilson",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    role: "Developer",
    email: "james.wilson@example.com",
  },
  {
    id: "u3",
    name: "Sarah Chen",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    role: "Designer",
    email: "sarah.chen@example.com",
  },
  {
    id: "u4",
    name: "Michael Brown",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    role: "Marketing",
    email: "michael.brown@example.com",
  },
  {
    id: "u5",
    name: "Emily Davis",
    avatar: "https://randomuser.me/api/portraits/women/89.jpg",
    role: "Developer",
    email: "emily.davis@example.com",
  },
]

const generateMockGoals = (): Goal[] => {
  const categories = ["Personal", "Work", "Health", "Learning", "Financial"]
  const priorities = ["low", "medium", "high"] as const
  const colors = [
    "#3B82F6", // blue
    "#10B981", // green
    "#F59E0B", // amber
    "#8B5CF6", // purple
    "#EC4899", // pink
  ]

  return Array.from({ length: 8 }, (_, i) => {
    const category = categories[Math.floor(Math.random() * categories.length)]
    const priority = priorities[Math.floor(Math.random() * priorities.length)]
    const progress = Math.floor(Math.random() * 101)
    const ownerId = mockUsers[Math.floor(Math.random() * mockUsers.length)].id
    const color = colors[Math.floor(Math.random() * colors.length)]

    // Generate random team members (1-3 members)
    const teamMembersCount = Math.floor(Math.random() * 3) + 1
    const teamMembers: string[] = []
    for (let j = 0; j < teamMembersCount; j++) {
      const randomUserId = mockUsers[Math.floor(Math.random() * mockUsers.length)].id
      if (!teamMembers.includes(randomUserId) && randomUserId !== ownerId) {
        teamMembers.push(randomUserId)
      }
    }

    // Generate random milestones (2-5 milestones)
    const milestonesCount = Math.floor(Math.random() * 4) + 2
    const milestones: Milestone[] = Array.from({ length: milestonesCount }, (_, j) => {
      const completed = Math.random() > 0.5
      return {
        id: `m${i}-${j}`,
        title: `Milestone ${j + 1}`,
        description: `Description for milestone ${j + 1}`,
        completed,
        dueDate: new Date(Date.now() + (j + 1) * 86400000 * 7), // Due date is j+1 weeks from now
      }
    })

    // Generate random comments (0-3 comments)
    const commentsCount = Math.floor(Math.random() * 4)
    const comments: Comment[] = Array.from({ length: commentsCount }, (_, j) => {
      const commentUserId = mockUsers[Math.floor(Math.random() * mockUsers.length)].id
      return {
        id: `c${i}-${j}`,
        userId: commentUserId,
        text: `This is comment ${j + 1} for goal ${i + 1}. Keep up the good work!`,
        timestamp: new Date(Date.now() - j * 86400000), // j days ago
      }
    })

    return {
      id: `g${i}`,
      title: [
        "Complete Website Redesign",
        "Learn Spanish",
        "Implement New Feature",
        "Run a Marathon",
        "Save for Vacation",
        "Read 12 Books This Year",
        "Launch Marketing Campaign",
        "Improve Team Communication",
      ][i],
      description: [
        "Redesign the company website with a modern look and improved UX.",
        "Reach conversational fluency in Spanish by the end of the year.",
        "Implement the new user authentication system for our platform.",
        "Train and complete a full marathon in under 4 hours.",
        "Save $5,000 for a vacation to Japan next summer.",
        "Read one book per month to expand knowledge and skills.",
        "Plan and execute a comprehensive marketing campaign for Q3.",
        "Establish better communication practices within the team.",
      ][i],
      progress,
      category,
      priority,
      dueDate: new Date(Date.now() + (i + 1) * 86400000 * 30), // Due date is i+1 months from now
      createdAt: new Date(Date.now() - (i + 1) * 86400000 * 7), // Created i+1 weeks ago
      ownerId,
      teamMembers,
      comments,
      milestones,
      color,
    }
  })
}

const generateMockNotifications = (goals: Goal[]): Notification[] => {
  const notifications: Notification[] = []

  goals.forEach((goal) => {
    // Comment notifications
    goal.comments.forEach((comment) => {
      notifications.push({
        id: `n-c-${comment.id}`,
        userId: comment.userId,
        message: `${mockUsers.find((u) => u.id === comment.userId)?.name} commented on "${goal.title}"`,
        read: Math.random() > 0.7,
        timestamp: comment.timestamp,
        type: "comment",
      })
    })

    // Milestone notifications
    goal.milestones
      .filter((m) => m.completed)
      .forEach((milestone) => {
        notifications.push({
          id: `n-m-${milestone.id}`,
          userId: goal.ownerId,
          message: `Milestone "${milestone.title}" completed for "${goal.title}"`,
          read: Math.random() > 0.5,
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 7) * 86400000),
          type: "milestone",
        })
      })

    // Progress notifications
    if (goal.progress > 50 && goal.progress < 100) {
      notifications.push({
        id: `n-p-${goal.id}`,
        userId: goal.ownerId,
        message: `"${goal.title}" is now ${goal.progress}% complete`,
        read: Math.random() > 0.3,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 3) * 86400000),
        type: "progress",
      })
    }
  })

  // Sort by timestamp (newest first)
  return notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

// Main Component
export default function GoalTracker() {
  // State
  const [goals, setGoals] = useState<Goal[]>([])
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([])
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAddGoalModal, setShowAddGoalModal] = useState(false)
  const [newGoalTitle, setNewGoalTitle] = useState("")
  const [newGoalDescription, setNewGoalDescription] = useState("")
  const [newGoalCategory, setNewGoalCategory] = useState("Work")
  const [newGoalPriority, setNewGoalPriority] = useState<"low" | "medium" | "high">("medium")
  const [newGoalDueDate, setNewGoalDueDate] = useState("")
  const [newGoalColor, setNewGoalColor] = useState("#3B82F6")
  const [newComment, setNewComment] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null)
  const [sortOption, setSortOption] = useState<string>("dueDate")
  const [searchQuery, setSearchQuery] = useState("")
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("")
  const [newMilestoneDescription, setNewMilestoneDescription] = useState("")
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState("")
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null)
  const [isEditingGoal, setIsEditingGoal] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "goals" | "analytics">("goals")

  const notificationRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)
  const userProfileRef = useRef<HTMLDivElement>(null)

  // Initialize data
  useEffect(() => {
    const mockGoals = generateMockGoals()
    setGoals(mockGoals)
    setFilteredGoals(mockGoals)
    setNotifications(generateMockNotifications(mockGoals))
  }, [])

  // Filter and sort goals
  useEffect(() => {
    let filtered = [...goals]

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter((goal) => goal.category === categoryFilter)
    }

    // Apply priority filter
    if (priorityFilter) {
      filtered = filtered.filter((goal) => goal.priority === priorityFilter)
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (goal) => goal.title.toLowerCase().includes(query) || goal.description.toLowerCase().includes(query),
      )
    }

    // Apply sorting
    switch (sortOption) {
      case "dueDate":
        filtered.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
        break
      case "progress":
        filtered.sort((a, b) => b.progress - a.progress)
        break
      case "priority":
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
        break
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        break
    }

    setFilteredGoals(filtered)
  }, [goals, categoryFilter, priorityFilter, sortOption, searchQuery])

  // Close modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNotifications && notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }

      if (showSettings && settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false)
      }

      if (showUserProfile && userProfileRef.current && !userProfileRef.current.contains(event.target as Node)) {
        setShowUserProfile(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showNotifications, showSettings, showUserProfile])

  // Apply theme
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Add transition for smooth theme changes
    document.documentElement.style.colorScheme = theme
    document.documentElement.style.transition = "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease"
  }, [theme])

  // Handle adding a new goal
  const handleAddGoal = () => {
    if (!newGoalTitle) return

    const newGoal: Goal = {
      id: `g${goals.length + 1}`,
      title: newGoalTitle,
      description: newGoalDescription,
      progress: 0,
      category: newGoalCategory,
      priority: newGoalPriority,
      dueDate: newGoalDueDate ? new Date(newGoalDueDate) : new Date(Date.now() + 30 * 86400000),
      createdAt: new Date(),
      ownerId: currentUser.id,
      teamMembers: [],
      comments: [],
      milestones: [],
      color: newGoalColor,
    }

    if (isEditingGoal && selectedGoal) {
      // Update existing goal
      const updatedGoals = goals.map((goal) =>
        goal.id === selectedGoal.id
          ? {
              ...goal,
              title: newGoalTitle,
              description: newGoalDescription,
              category: newGoalCategory,
              priority: newGoalPriority,
              dueDate: newGoalDueDate ? new Date(newGoalDueDate) : goal.dueDate,
              color: newGoalColor,
            }
          : goal,
      )
      setGoals(updatedGoals)
    } else {
      // Add new goal
      setGoals([...goals, newGoal])
    }

    // Reset form
    setNewGoalTitle("")
    setNewGoalDescription("")
    setNewGoalCategory("Work")
    setNewGoalPriority("medium")
    setNewGoalDueDate("")
    setNewGoalColor("#3B82F6")
    setShowAddGoalModal(false)
    setIsEditingGoal(false)
  }

  // Handle updating goal progress
  const handleUpdateProgress = (goalId: string, newProgress: number) => {
    const updatedGoals = goals.map((goal) => (goal.id === goalId ? { ...goal, progress: newProgress } : goal))
    setGoals(updatedGoals)

    // Add notification for progress update
    if (newProgress === 100) {
      const goal = goals.find((g) => g.id === goalId)
      if (goal) {
        const newNotification: Notification = {
          id: `n-p-${Date.now()}`,
          userId: currentUser.id,
          message: `"${goal.title}" is now complete!`,
          read: false,
          timestamp: new Date(),
          type: "progress",
        }
        setNotifications([newNotification, ...notifications])
      }
    }
  }

  // Handle adding a comment
  const handleAddComment = (goalId: string) => {
    if (!newComment.trim()) return

    const updatedGoals = goals.map((goal) => {
      if (goal.id === goalId) {
        const newCommentObj: Comment = {
          id: `c${goal.comments.length + 1}`,
          userId: currentUser.id,
          text: newComment,
          timestamp: new Date(),
        }
        return {
          ...goal,
          comments: [...goal.comments, newCommentObj],
        }
      }
      return goal
    })

    setGoals(updatedGoals)
    setNewComment("")

    // Add notification for new comment
    const goal = goals.find((g) => g.id === goalId)
    if (goal) {
      const newNotification: Notification = {
        id: `n-c-${Date.now()}`,
        userId: currentUser.id,
        message: `${currentUser.name} commented on "${goal.title}"`,
        read: false,
        timestamp: new Date(),
        type: "comment",
      }
      setNotifications([newNotification, ...notifications])
    }
  }

  // Handle adding a milestone
  const handleAddMilestone = () => {
    if (!selectedGoal || !newMilestoneTitle) return

    const newMilestone: Milestone = {
      id: `m${selectedGoal.milestones.length + 1}`,
      title: newMilestoneTitle,
      description: newMilestoneDescription,
      completed: false,
      dueDate: newMilestoneDueDate ? new Date(newMilestoneDueDate) : new Date(Date.now() + 7 * 86400000),
    }

    const updatedGoals = goals.map((goal) => {
      if (goal.id === selectedGoal.id) {
        return {
          ...goal,
          milestones: [...goal.milestones, newMilestone],
        }
      }
      return goal
    })

    setGoals(updatedGoals)
    setSelectedGoal({
      ...selectedGoal,
      milestones: [...selectedGoal.milestones, newMilestone],
    })
    setNewMilestoneTitle("")
    setNewMilestoneDescription("")
    setNewMilestoneDueDate("")
    setShowAddMilestoneModal(false)
  }

  // Handle toggling milestone completion
  const handleToggleMilestone = (goalId: string, milestoneId: string) => {
    const updatedGoals = goals.map((goal) => {
      if (goal.id === goalId) {
        const updatedMilestones = goal.milestones.map((milestone) => {
          if (milestone.id === milestoneId) {
            return { ...milestone, completed: !milestone.completed }
          }
          return milestone
        })
        return { ...goal, milestones: updatedMilestones }
      }
      return goal
    })

    setGoals(updatedGoals)

    // Update selected goal if it's the one being modified
    if (selectedGoal && selectedGoal.id === goalId) {
      const updatedMilestones = selectedGoal.milestones.map((milestone) => {
        if (milestone.id === milestoneId) {
          return { ...milestone, completed: !milestone.completed }
        }
        return milestone
      })
      setSelectedGoal({ ...selectedGoal, milestones: updatedMilestones })

      // Add notification for milestone completion
      const milestone = selectedGoal.milestones.find((m) => m.id === milestoneId)
      if (milestone && !milestone.completed) {
        const newNotification: Notification = {
          id: `n-m-${Date.now()}`,
          userId: currentUser.id,
          message: `Milestone "${milestone.title}" completed for "${selectedGoal.title}"`,
          read: false,
          timestamp: new Date(),
          type: "milestone",
        }
        setNotifications([newNotification, ...notifications])
      }
    }
  }

  // Handle deleting a goal
  const handleDeleteGoal = () => {
    if (!goalToDelete) return

    const updatedGoals = goals.filter((goal) => goal.id !== goalToDelete)
    setGoals(updatedGoals)
    setShowDeleteConfirmation(false)
    setGoalToDelete(null)
    setSelectedGoal(null)
  }

  // Handle editing a goal
  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal)
    setNewGoalTitle(goal.title)
    setNewGoalDescription(goal.description)
    setNewGoalCategory(goal.category)
    setNewGoalPriority(goal.priority)
    setNewGoalDueDate(goal.dueDate.toISOString().split("T")[0])
    setNewGoalColor(goal.color)
    setIsEditingGoal(true)
    setShowAddGoalModal(true)
  }

  // Format date
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Get user by ID
  const getUserById = (userId: string): User => {
    return mockUsers.find((user) => user.id === userId) || mockUsers[0]
  }

  // Calculate overall progress
  const calculateOverallProgress = (): number => {
    if (goals.length === 0) return 0
    const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0)
    return Math.round(totalProgress / goals.length)
  }

  // Get completed goals count
  const getCompletedGoalsCount = (): number => {
    return goals.filter((goal) => goal.progress === 100).length
  }

  // Get upcoming milestones
  const getUpcomingMilestones = (): Milestone[] => {
    const allMilestones: { milestone: Milestone; goalTitle: string }[] = []

    goals.forEach((goal) => {
      goal.milestones
        .filter((m) => !m.completed && m.dueDate > new Date())
        .forEach((milestone) => {
          allMilestones.push({ milestone, goalTitle: goal.title })
        })
    })

    return allMilestones
      .sort((a, b) => a.milestone.dueDate.getTime() - b.milestone.dueDate.getTime())
      .slice(0, 5)
      .map((item) => ({ ...item.milestone, title: `${item.milestone.title} (${item.goalTitle})` }))
  }

  // Get chart data
  const getChartData = () => {
    const categories = ["Personal", "Work", "Health", "Learning", "Financial"]
    return categories.map((category) => {
      const categoryGoals = goals.filter((goal) => goal.category === category)
      const totalProgress = categoryGoals.reduce((sum, goal) => sum + goal.progress, 0)
      const avgProgress = categoryGoals.length > 0 ? totalProgress / categoryGoals.length : 0

      return {
        name: category,
        progress: Math.round(avgProgress),
        count: categoryGoals.length,
        fill: theme === "dark" ? "#60A5FA" : "#3B82F6", // Brighter blue in dark mode
      }
    })
  }

  // Get progress over time data
  const getProgressOverTimeData = () => {
    // Create data for the last 7 days
    const data = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

      // Simulate progress data (in a real app, this would come from actual historical data)
      const progress = Math.floor(70 + Math.random() * 20) // Random progress between 70-90%

      data.push({
        date: dateStr,
        progress,
      })
    }

    return data
  }

  // Render priority badge
  const renderPriorityBadge = (priority: "low" | "medium" | "high") => {
    const colors = {
      low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    )
  }

  // Render progress bar
  const renderProgressBar = (progress: number, color: string) => {
    return (
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    )
  }

  // Render goal card
  const renderGoalCard = (goal: Goal) => {
    return (
      <motion.div
        key={goal.id}
        className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 dark:bg-gray-900 dark:border-gray-800 transition-colors duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -5 }}
      >
        <div className="h-2" style={{ backgroundColor: goal.color }} />
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
            <div className="flex space-x-2">
              {renderPriorityBadge(goal.priority)}
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium dark:bg-gray-700 dark:text-gray-300">
                {goal.category}
              </span>
            </div>
          </div>

          <p className="text-gray-600 mb-4 text-sm dark:text-gray-400">{goal.description}</p>

          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress: {goal.progress}%</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Due: {formatDate(goal.dueDate)}</span>
          </div>

          {renderProgressBar(goal.progress, goal.color)}

          <div className="mt-4 flex justify-between items-center">
            <div className="flex -space-x-2">
              {[goal.ownerId, ...goal.teamMembers].slice(0, 3).map((userId) => (
                <div key={userId} className="relative">
                  <Image
                    src={getUserById(userId).avatar || "/placeholder.svg"}
                    alt={getUserById(userId).name}
                    width={28}
                    height={28}
                    className="rounded-full border-2 border-white dark:border-gray-800"
                  />
                </div>
              ))}
              {[goal.ownerId, ...goal.teamMembers].length > 3 && (
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 text-xs font-medium text-gray-800 border-2 border-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-800">
                  +{[goal.ownerId, ...goal.teamMembers].length - 3}
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedGoal(goal)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                View Details
              </button>
              <button
                onClick={() => handleEditGoal(goal)}
                className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded-md text-sm font-medium text-blue-700 transition-colors dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
              >
                Edit
              </button>
            </div>
          </div>

          {goal.milestones.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Milestones</h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {goal.milestones.filter((m) => m.completed).length}/{goal.milestones.length} completed
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {goal.milestones.map((milestone) => (
                  <span
                    key={milestone.id}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      milestone.completed
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {milestone.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {goal.comments.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-500 mr-1 dark:text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {goal.comments.length} comment{goal.comments.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  // Render goal detail view
  const renderGoalDetail = () => {
    if (!selectedGoal) return null

    return (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 dark:bg-opacity-70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setSelectedGoal(null)}
      >
        <motion.div
          className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col dark:bg-gray-900 dark:border dark:border-gray-800 transition-colors duration-300"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-2" style={{ backgroundColor: selectedGoal.color }} />

          <div className="p-6 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedGoal.title}</h2>
                  {renderPriorityBadge(selectedGoal.priority)}
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium dark:bg-gray-700 dark:text-gray-300">
                    {selectedGoal.category}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">{selectedGoal.description}</p>
              </div>

              <button
                onClick={() => setSelectedGoal(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Progress</h3>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{selectedGoal.progress}%</span>
                  </div>

                  {renderProgressBar(selectedGoal.progress, selectedGoal.color)}

                  <div className="mt-4">
                    <label
                      htmlFor="progress-slider"
                      className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
                    >
                      Update Progress
                    </label>
                    <input
                      type="range"
                      id="progress-slider"
                      min="0"
                      max="100"
                      value={selectedGoal.progress}
                      onChange={(e) => handleUpdateProgress(selectedGoal.id, Number.parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Details</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Owner</span>
                      <div className="flex items-center">
                        <Image
                          src={getUserById(selectedGoal.ownerId).avatar || "/placeholder.svg"}
                          alt={getUserById(selectedGoal.ownerId).name}
                          width={24}
                          height={24}
                          className="rounded-full mr-2"
                        />
                        <span className="text-gray-900 dark:text-white">{getUserById(selectedGoal.ownerId).name}</span>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Created</span>
                      <span className="text-gray-900 dark:text-white">{formatDate(selectedGoal.createdAt)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Due Date</span>
                      <span className="text-gray-900 dark:text-white">{formatDate(selectedGoal.dueDate)}</span>
                    </div>

                    {selectedGoal.teamMembers.length > 0 && (
                      <div>
                        <span className="text-gray-600 block mb-2 dark:text-gray-400">Team Members</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedGoal.teamMembers.map((memberId) => (
                            <div
                              key={memberId}
                              className="flex items-center bg-gray-100 rounded-full px-3 py-1 dark:bg-gray-700"
                            >
                              <Image
                                src={getUserById(memberId).avatar || "/placeholder.svg"}
                                alt={getUserById(memberId).name}
                                width={20}
                                height={20}
                                className="rounded-full mr-2"
                              />
                              <span className="text-sm text-gray-800 dark:text-gray-200">
                                {getUserById(memberId).name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Milestones</h3>
                    <button
                      onClick={() => setShowAddMilestoneModal(true)}
                      className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded-md text-sm font-medium text-blue-700 transition-colors dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                    >
                      Add Milestone
                    </button>
                  </div>

                  {selectedGoal.milestones.length === 0 ? (
                    <p className="text-gray-500 text-sm dark:text-gray-400">
                      No milestones yet. Add one to track your progress.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedGoal.milestones.map((milestone) => (
                        <div key={milestone.id} className="flex items-start p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                          <div className="flex-shrink-0 mr-3">
                            <input
                              type="checkbox"
                              checked={milestone.completed}
                              onChange={() => handleToggleMilestone(selectedGoal.id, milestone.id)}
                              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-blue-600"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h4
                                className={`font-medium ${
                                  milestone.completed
                                    ? "line-through text-gray-500 dark:text-gray-400"
                                    : "text-gray-900 dark:text-white"
                                }`}
                              >
                                {milestone.title}
                              </h4>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Due: {formatDate(milestone.dueDate)}
                              </span>
                            </div>
                            <p
                              className={`text-sm ${
                                milestone.completed
                                  ? "line-through text-gray-500 dark:text-gray-400"
                                  : "text-gray-600 dark:text-gray-300"
                              }`}
                            >
                              {milestone.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comments</h3>
                  </div>

                  <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
                    {selectedGoal.comments.length === 0 ? (
                      <p className="text-gray-500 text-sm dark:text-gray-400">
                        No comments yet. Be the first to comment.
                      </p>
                    ) : (
                      selectedGoal.comments.map((comment) => (
                        <div key={comment.id} className="flex space-x-3">
                          <Image
                            src={getUserById(comment.userId).avatar || "/placeholder.svg"}
                            alt={getUserById(comment.userId).name}
                            width={36}
                            height={36}
                            className="rounded-full"
                          />
                          <div className="flex-1 bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {getUserById(comment.userId).name}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(comment.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm dark:text-gray-300">{comment.text}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <Image
                      src={currentUser.avatar || "/placeholder.svg"}
                      alt={currentUser.name}
                      width={36}
                      height={36}
                      className="rounded-full"
                    />
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        rows={2}
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => handleAddComment(selectedGoal.id)}
                          disabled={!newComment.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-blue-700 dark:hover:bg-blue-800"
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setGoalToDelete(selectedGoal.id)
                  setShowDeleteConfirmation(true)
                }}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
              >
                Delete Goal
              </button>
              <button
                onClick={() => handleEditGoal(selectedGoal)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                Edit Goal
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // Render add goal modal
  const renderAddGoalModal = () => {
    return (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 dark:bg-opacity-70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          setShowAddGoalModal(false)
          setIsEditingGoal(false)
        }}
      >
        <motion.div
          className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-md dark:bg-gray-800"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditingGoal ? "Edit Goal" : "Add New Goal"}
              </h2>
              <button
                onClick={() => {
                  setShowAddGoalModal(false)
                  setIsEditingGoal(false)
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAddGoal()
              }}
            >
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="goal-title"
                    className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="goal-title"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter goal title"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="goal-description"
                    className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
                  >
                    Description
                  </label>
                  <textarea
                    id="goal-description"
                    value={newGoalDescription}
                    onChange={(e) => setNewGoalDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter goal description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="goal-category"
                      className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
                    >
                      Category
                    </label>
                    <select
                      id="goal-category"
                      value={newGoalCategory}
                      onChange={(e) => setNewGoalCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="Personal">Personal</option>
                      <option value="Work">Work</option>
                      <option value="Health">Health</option>
                      <option value="Learning">Learning</option>
                      <option value="Financial">Financial</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="goal-priority"
                      className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
                    >
                      Priority
                    </label>
                    <select
                      id="goal-priority"
                      value={newGoalPriority}
                      onChange={(e) => setNewGoalPriority(e.target.value as "low" | "medium" | "high")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="goal-due-date"
                    className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
                  >
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="goal-due-date"
                    value={newGoalDueDate}
                    onChange={(e) => setNewGoalDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="goal-color"
                    className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
                  >
                    Color
                  </label>
                  <div className="flex space-x-2">
                    {["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewGoalColor(color)}
                        className={`w-8 h-8 rounded-full ${
                          newGoalColor === color ? "ring-2 ring-offset-2 ring-gray-400" : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <input
                      type="color"
                      id="goal-color"
                      value={newGoalColor}
                      onChange={(e) => setNewGoalColor(e.target.value)}
                      className="w-8 h-8 p-0 border-0 rounded-full cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddGoalModal(false)
                    setIsEditingGoal(false)
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                  {isEditingGoal ? "Update Goal" : "Add Goal"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // Render add milestone modal
  const renderAddMilestoneModal = () => {
    if (!selectedGoal) return null

    return (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 dark:bg-opacity-70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowAddMilestoneModal(false)}
      >
        <motion.div
          className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-md dark:bg-gray-800"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Milestone</h2>
              <button
                onClick={() => setShowAddMilestoneModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAddMilestone()
              }}
            >
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="milestone-title"
                    className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="milestone-title"
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter milestone title"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="milestone-description"
                    className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
                  >
                    Description
                  </label>
                  <textarea
                    id="milestone-description"
                    value={newMilestoneDescription}
                    onChange={(e) => setNewMilestoneDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter milestone description"
                    rows={3}
                  />
                </div>

                <div>
                  <label
                    htmlFor="milestone-due-date"
                    className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
                  >
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="milestone-due-date"
                    value={newMilestoneDueDate}
                    onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddMilestoneModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // Render delete confirmation modal
  const renderDeleteConfirmation = () => {
    return (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 dark:bg-opacity-70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowDeleteConfirmation(false)}
      >
        <motion.div
          className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-md dark:bg-gray-800"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Goal</h2>
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-gray-700 mb-4 dark:text-gray-300">
              Are you sure you want to delete this goal? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGoal}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors dark:bg-red-700 dark:hover:bg-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // Render notifications panel
  const renderNotificationsPanel = () => {
    return (
      <div
        ref={notificationRef}
        className="absolute top-16 right-4 w-80 max-h-[70vh] overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200 z-50 dark:bg-gray-900 dark:border-gray-800 transition-colors duration-300"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-2">
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-4 dark:text-gray-400">No notifications</p>
          ) : (
            notifications.map((notification) => {
              const user = getUserById(notification.userId)

              // Determine icon based on notification type
              let icon
              let bgColor

              switch (notification.type) {
                case "comment":
                  icon = (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  )
                  bgColor = "bg-blue-50 dark:bg-blue-900/20"
                  break
                case "milestone":
                  icon = (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )
                  bgColor = "bg-green-50 dark:bg-green-900/20"
                  break
                case "progress":
                  icon = (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-yellow-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  )
                  bgColor = "bg-yellow-50 dark:bg-yellow-900/20"
                  break
                default:
                  icon = (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  )
                  bgColor = "bg-gray-50 dark:bg-gray-700"
              }

              return (
                <div
                  key={notification.id}
                  className={`flex items-start p-3 rounded-lg mb-2 ${notification.read ? "opacity-60" : ""} ${bgColor}`}
                >
                  <div className="flex-shrink-0 mr-3">{icon}</div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <Image
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.name}
                          width={20}
                          height={20}
                          className="rounded-full mr-1"
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(notification.timestamp).toLocaleString(undefined, {
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1 dark:text-gray-300">{notification.message}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }

  // Render settings panel
  const renderSettingsPanel = () => {
    return (
      <div
        ref={settingsRef}
        className="absolute top-16 right-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 dark:bg-gray-900 dark:border-gray-800 transition-colors duration-300"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            <div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={theme === "dark"}
                    onChange={() => setTheme(theme === "light" ? "dark" : "light")}
                  />
                  <div className="block bg-gray-300 w-14 h-8 rounded-full dark:bg-gray-600"></div>
                  <div
                    className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                      theme === "dark" ? "transform translate-x-6" : ""
                    }`}
                  ></div>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Default Sort</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="dueDate">Due Date</option>
                <option value="progress">Progress</option>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">User</label>
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const selectedUser = mockUsers.find((user) => user.id === e.target.value)
                  if (selectedUser) {
                    setCurrentUser(selectedUser)
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {mockUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render user profile panel
  const renderUserProfilePanel = () => {
    return (
      <div
        ref={userProfileRef}
        className="absolute top-16 right-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 dark:bg-gray-900 dark:border-gray-800 transition-colors duration-300"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h3>
            <button
              onClick={() => setShowUserProfile(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex flex-col items-center mb-4">
            <Image
              src={currentUser.avatar || "/placeholder.svg"}
              alt={currentUser.name}
              width={80}
              height={80}
              className="rounded-full mb-2"
            />
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{currentUser.name}</h4>
            <p className="text-gray-600 dark:text-gray-400">{currentUser.role}</p>
            <p className="text-gray-500 text-sm dark:text-gray-500">{currentUser.email}</p>
          </div>

          <div className="space-y-3">
            <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors flex items-center dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Edit Profile
            </button>

            <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors flex items-center dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Account Settings
            </button>

            <button className="w-full px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md text-sm font-medium text-red-700 transition-colors flex items-center dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render overview tab
  const renderOverviewTab = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">Overall Progress</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                  strokeDasharray="100, 100"
                  className="dark:stroke-gray-700"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  strokeDasharray={`${calculateOverallProgress()}, 100`}
                  className="dark:stroke-blue-500"
                />
                <text x="18" y="20.5" textAnchor="middle" fontSize="8" fill="#111827" className="dark:fill-white">
                  {calculateOverallProgress()}%
                </text>
              </svg>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-3 dark:bg-blue-900/20">
              <div className="text-blue-600 text-2xl font-bold dark:text-blue-400">{goals.length}</div>
              <div className="text-blue-800 text-sm dark:text-blue-300">Total Goals</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 dark:bg-green-900/20">
              <div className="text-green-600 text-2xl font-bold dark:text-green-400">{getCompletedGoalsCount()}</div>
              <div className="text-green-800 text-sm dark:text-green-300">Completed</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">Progress by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1F2937" : "#FFFFFF",
                    borderColor: theme === "dark" ? "#374151" : "#E5E7EB",
                    color: theme === "dark" ? "#F9FAFB" : "#111827",
                  }}
                />
                <Bar dataKey="progress" fill={theme === "dark" ? "#60A5FA" : "#3B82F6"} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">Upcoming Milestones</h3>
          <div className="space-y-3">
            {getUpcomingMilestones().length === 0 ? (
              <p className="text-gray-500 text-sm dark:text-gray-400">No upcoming milestones</p>
            ) : (
              getUpcomingMilestones().map((milestone) => (
                <div key={milestone.id} className="flex items-start p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                  <div className="flex-shrink-0 mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white">{milestone.title}</h4>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Due: {formatDate(milestone.dueDate)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">Progress Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getProgressOverTimeData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1F2937" : "#FFFFFF",
                    borderColor: theme === "dark" ? "#374151" : "#E5E7EB",
                    color: theme === "dark" ? "#F9FAFB" : "#111827",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="progress"
                  stroke={theme === "dark" ? "#60A5FA" : "#3B82F6"}
                  strokeWidth={2}
                  dot={{ r: 4, fill: theme === "dark" ? "#60A5FA" : "#3B82F6" }}
                  activeDot={{ r: 6, fill: theme === "dark" ? "#93C5FD" : "#3B82F6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">Recent Activity</h3>
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notification) => {
              const user = getUserById(notification.userId)

              return (
                <div key={notification.id} className="flex items-start p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                  <div className="flex-shrink-0 mr-3">
                    <Image
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(notification.timestamp).toLocaleString(undefined, {
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true,
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 mt-1 dark:text-gray-300">{notification.message}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Render analytics tab
  const renderAnalyticsTab = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">Progress by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1F2937" : "#FFFFFF",
                    borderColor: theme === "dark" ? "#374151" : "#E5E7EB",
                    color: theme === "dark" ? "#F9FAFB" : "#111827",
                  }}
                />
                <Bar dataKey="progress" fill={theme === "dark" ? "#60A5FA" : "#3B82F6"} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">Goals by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1F2937" : "#FFFFFF",
                    borderColor: theme === "dark" ? "#374151" : "#E5E7EB",
                    color: theme === "dark" ? "#F9FAFB" : "#111827",
                  }}
                />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">Progress Over Time</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getProgressOverTimeData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1F2937" : "#FFFFFF",
                    borderColor: theme === "dark" ? "#374151" : "#E5E7EB",
                    color: theme === "dark" ? "#F9FAFB" : "#111827",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="progress"
                  stroke={theme === "dark" ? "#60A5FA" : "#3B82F6"}
                  strokeWidth={2}
                  dot={{ r: 4, fill: theme === "dark" ? "#60A5FA" : "#3B82F6" }}
                  activeDot={{ r: 6, fill: theme === "dark" ? "#93C5FD" : "#3B82F6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-950 dark:text-white transition-colors duration-300`}>
      {/* Navbar */}
      <header className="bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-600 dark:text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">GoalTracker</span>
              </div>

              <nav className="hidden md:ml-6 md:flex md:space-x-8">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === "overview"
                      ? "border-blue-500 text-gray-900 dark:text-white"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("goals")}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === "goals"
                      ? "border-blue-500 text-gray-900 dark:text-white"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  Goals
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === "analytics"
                      ? "border-blue-500 text-gray-900 dark:text-white"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  Analytics
                </button>
              </nav>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0">
                <button
                  onClick={() => setShowAddGoalModal(true)}
                  className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="-ml-1 mr-2 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>New Goal</span>
                </button>
              </div>

              <div className="hidden md:ml-4 md:flex md:items-center">
                <div className="ml-3 relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <span className="sr-only">View notifications</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    {notifications.filter((n) => !n.read).length > 0 && (
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800" />
                    )}
                  </button>
                  {showNotifications && renderNotificationsPanel()}
                </div>

                <div className="ml-3 relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <span className="sr-only">Settings</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                  {showSettings && renderSettingsPanel()}
                </div>

                <div className="ml-3 relative">
                  <button
                    onClick={() => setShowUserProfile(!showUserProfile)}
                    className="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <span className="sr-only">Open user menu</span>
                    <Image
                      src={currentUser.avatar || "/placeholder.svg"}
                      alt={currentUser.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </button>
                  {showUserProfile && renderUserProfilePanel()}
                </div>
              </div>

              <div className="-mr-2 flex md:hidden">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
                >
                  <span className="sr-only">Open main menu</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`${showMobileMenu ? "hidden" : "block"} h-6 w-6`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`${showMobileMenu ? "block" : "hidden"} h-6 w-6`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${showMobileMenu ? "block" : "hidden"} md:hidden`}>
          <div className="pt-2 pb-3 space-y-1">
            <button
              onClick={() => {
                setActiveTab("overview")
                setShowMobileMenu(false)
              }}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300"
                  : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => {
                setActiveTab("goals")
                setShowMobileMenu(false)
              }}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                activeTab === "goals"
                  ? "border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300"
                  : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Goals
            </button>
            <button
              onClick={() => {
                setActiveTab("analytics")
                setShowMobileMenu(false)
              }}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                activeTab === "analytics"
                  ? "border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300"
                  : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Analytics
            </button>
          </div>

          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <Image
                  src={currentUser.avatar || "/placeholder.svg"}
                  alt={currentUser.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800 dark:text-white">{currentUser.name}</div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{currentUser.email}</div>
              </div>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="ml-auto flex-shrink-0 p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <span className="sr-only">View notifications</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800" />
                )}
              </button>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={() => {
                  setShowUserProfile(true)
                  setShowMobileMenu(false)
                }}
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
              >
                Your Profile
              </button>
              <button
                onClick={() => {
                  setShowSettings(true)
                  setShowMobileMenu(false)
                }}
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
              >
                Settings
              </button>
              <button className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="px-4 sm:px-0 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeTab === "overview"
                  ? "Dashboard Overview"
                  : activeTab === "goals"
                    ? "Goal Management"
                    : "Analytics & Insights"}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {activeTab === "overview"
                  ? "Track your progress and upcoming milestones"
                  : activeTab === "goals"
                    ? "Manage and track your personal and team goals"
                    : "Analyze your progress and performance"}
              </p>
            </div>

            {activeTab === "goals" && (
              <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search goals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <select
                    value={categoryFilter || ""}
                    onChange={(e) => setCategoryFilter(e.target.value || null)}
                    className="pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">All Categories</option>
                    <option value="Personal">Personal</option>
                    <option value="Work">Work</option>
                    <option value="Health">Health</option>
                    <option value="Learning">Learning</option>
                    <option value="Financial">Financial</option>
                  </select>

                  <select
                    value={priorityFilter || ""}
                    onChange={(e) => setPriorityFilter(e.target.value || null)}
                    className="pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>

                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="dueDate">Sort by Due Date</option>
                    <option value="progress">Sort by Progress</option>
                    <option value="priority">Sort by Priority</option>
                    <option value="title">Sort by Title</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6 sm:px-0">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderOverviewTab()}
              </motion.div>
            )}

            {activeTab === "goals" && (
              <motion.div
                key="goals"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGoals.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 text-gray-400 mb-4 dark:text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-1 dark:text-white">No goals found</h3>
                      <p className="text-gray-500 text-center max-w-md mb-6 dark:text-gray-400">
                        {searchQuery || categoryFilter || priorityFilter
                          ? "Try adjusting your filters to see more results."
                          : "Get started by creating your first goal."}
                      </p>
                      <button
                        onClick={() => setShowAddGoalModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="-ml-1 mr-2 h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Add New Goal
                      </button>
                    </div>
                  ) : (
                    filteredGoals.map((goal) => renderGoalCard(goal))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderAnalyticsTab()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-inner dark:bg-gray-900 dark:border-t dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600 dark:text-blue-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">GoalTracker</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                Terms of Service
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                Contact Us
              </a>
            </div>
            <div className="mt-4 md:mt-0 text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} GoalTracker. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {selectedGoal && renderGoalDetail()}
        {showAddGoalModal && renderAddGoalModal()}
        {showAddMilestoneModal && renderAddMilestoneModal()}
        {showDeleteConfirmation && renderDeleteConfirmation()}
      </AnimatePresence>
    </div>
  )
}
