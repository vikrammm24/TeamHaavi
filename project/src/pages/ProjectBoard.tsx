import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Filter, Search, Clock, MapPin, User, Star, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  location: string;
  budget: string;
  estimatedTime: string;
  requiredSkills: string[];
  assignedTo?: string;
  reportedBy: string;
  createdAt: Date;
  aiMatchScore?: number;
}

interface Column {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

const ProjectBoard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showAIRecommendations, setShowAIRecommendations] = useState(true);

  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'available',
      title: 'Available Jobs',
      color: 'bg-blue-500',
      tasks: [
        {
          id: '1',
          title: 'Street Light Repair',
          description: 'Replace faulty LED bulb and check electrical connections on Main Street',
          priority: 'medium',
          category: 'Electrical',
          location: 'Main Street & 1st Ave',
          budget: '$150',
          estimatedTime: '2 hours',
          requiredSkills: ['Electrical', 'Safety Certified'],
          reportedBy: 'Sarah Johnson',
          createdAt: new Date(Date.now() - 3600000),
          aiMatchScore: 95
        },
        {
          id: '2',
          title: 'Pothole Repair',
          description: 'Fill and seal medium-sized pothole causing traffic disruption',
          priority: 'high',
          category: 'Road Maintenance',
          location: 'Oak Avenue & 3rd St',
          budget: '$300',
          estimatedTime: '4 hours',
          requiredSkills: ['Asphalt Work', 'Heavy Equipment'],
          reportedBy: 'Mike Chen',
          createdAt: new Date(Date.now() - 7200000),
          aiMatchScore: 88
        },
        {
          id: '3',
          title: 'Graffiti Removal',
          description: 'Clean graffiti from bus stop walls and apply protective coating',
          priority: 'low',
          category: 'Cleaning',
          location: 'Bus Stop #47',
          budget: '$80',
          estimatedTime: '1 hour',
          requiredSkills: ['Cleaning', 'Chemical Handling'],
          reportedBy: 'City Authority',
          createdAt: new Date(Date.now() - 10800000),
          aiMatchScore: 72
        }
      ]
    },
    {
      id: 'applied',
      title: 'Applied',
      color: 'bg-yellow-500',
      tasks: [
        {
          id: '4',
          title: 'Traffic Signal Maintenance',
          description: 'Routine maintenance and timing adjustment for downtown intersection',
          priority: 'medium',
          category: 'Traffic Systems',
          location: 'Downtown Intersection',
          budget: '$200',
          estimatedTime: '3 hours',
          requiredSkills: ['Electronics', 'Traffic Systems'],
          reportedBy: 'Traffic Department',
          createdAt: new Date(Date.now() - 14400000),
          assignedTo: 'You'
        }
      ]
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      color: 'bg-orange-500',
      tasks: [
        {
          id: '5',
          title: 'Park Bench Repair',
          description: 'Replace damaged wooden slats and apply weather protection',
          priority: 'low',
          category: 'Park Maintenance',
          location: 'Central Park',
          budget: '$120',
          estimatedTime: '2 hours',
          requiredSkills: ['Carpentry', 'Outdoor Work'],
          reportedBy: 'Park Services',
          createdAt: new Date(Date.now() - 18000000),
          assignedTo: 'You'
        }
      ]
    },
    {
      id: 'completed',
      title: 'Completed',
      color: 'bg-green-500',
      tasks: [
        {
          id: '6',
          title: 'Water Fountain Fix',
          description: 'Repaired water pressure issue and replaced filter system',
          priority: 'medium',
          category: 'Plumbing',
          location: 'City Hall Plaza',
          budget: '$180',
          estimatedTime: '2.5 hours',
          requiredSkills: ['Plumbing', 'Water Systems'],
          reportedBy: 'Facilities Team',
          createdAt: new Date(Date.now() - 86400000),
          assignedTo: 'You'
        }
      ]
    }
  ]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    const sourceTask = sourceColumn.tasks.find(task => task.id === draggableId);
    if (!sourceTask) return;

    // Update task assignment based on column
    const updatedTask = {
      ...sourceTask,
      assignedTo: destination.droppableId === 'available' ? undefined : 'You'
    };

    const newColumns = columns.map(column => {
      if (column.id === source.droppableId) {
        return {
          ...column,
          tasks: column.tasks.filter(task => task.id !== draggableId)
        };
      }
      if (column.id === destination.droppableId) {
        const newTasks = [...column.tasks];
        newTasks.splice(destination.index, 0, updatedTask);
        return {
          ...column,
          tasks: newTasks
        };
      }
      return column;
    });

    setColumns(newColumns);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-red-400';
      case 'medium': return 'bg-yellow-400';
      case 'low': return 'bg-green-400';
      default: return 'bg-gray-400';
    }
  };

  const filteredColumns = columns.map(column => ({
    ...column,
    tasks: column.tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      return matchesSearch && matchesPriority;
    })
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-lg border-b"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </motion.button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Project Board</h1>
                <p className="text-gray-600">Manage and track city improvement projects</p>
              </div>
            </div>

            {/* AI Recommendations Toggle */}
            {user?.role === 'professional' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg"
              >
                <Zap className="w-5 h-5" />
                <span className="font-medium">AI Recommendations Active</span>
              </motion.div>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Kanban Board */}
      <div className="container mx-auto px-4 py-8">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {filteredColumns.map((column, columnIndex) => (
              <motion.div
                key={column.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: columnIndex * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                {/* Column Header */}
                <div className={`${column.color} text-white p-4`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{column.title}</h3>
                    <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
                      {column.tasks.length}
                    </span>
                  </div>
                </div>

                {/* Tasks */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-4 min-h-[500px] transition-colors duration-200 ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'
                      }`}
                    >
                      <AnimatePresence>
                        {column.tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <motion.div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                whileHover={{ scale: 1.02 }}
                                className={`bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 transition-all duration-200 ${
                                  snapshot.isDragging ? 'shadow-2xl rotate-3' : 'hover:shadow-lg'
                                } ${getPriorityColor(task.priority).replace('bg-', 'border-')}`}
                              >
                                {/* AI Match Score */}
                                {task.aiMatchScore && user?.role === 'professional' && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center gap-1 mb-2"
                                  >
                                    <Zap className="w-4 h-4 text-purple-500" />
                                    <span className="text-sm font-medium text-purple-600">
                                      {task.aiMatchScore}% Match
                                    </span>
                                  </motion.div>
                                )}

                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-semibold text-gray-800 text-sm">{task.title}</h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                  </span>
                                </div>

                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>

                                <div className="space-y-2 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{task.location}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{task.estimatedTime}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    <span>By {task.reportedBy}</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                  <span className="font-semibold text-green-600">{task.budget}</span>
                                  <div className="flex flex-wrap gap-1">
                                    {task.requiredSkills.slice(0, 2).map((skill, skillIndex) => (
                                      <span
                                        key={skillIndex}
                                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                    {task.requiredSkills.length > 2 && (
                                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                        +{task.requiredSkills.length - 2}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {task.assignedTo && (
                                  <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                                    <Star className="w-3 h-3" />
                                    <span>Assigned to {task.assignedTo}</span>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </Draggable>
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}

                      {/* Add Task Button */}
                      {column.id === 'available' && user?.role === 'authority' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          Add New Project
                        </motion.button>
                      )}
                    </div>
                  )}
                </Droppable>
              </motion.div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default ProjectBoard;