import Task from "../models/Task.js";       

export const createTask = async (req, res) => {
  try {
    const { title, status, priority, deadline, projectId } = req.body;

    const task = await Task.create({
      title,
      status,
      priority,
      deadline,
      projectId,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, priority, startDate, endDate, page = 1, limit = 10 } = req.query;

    const query = { projectId };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (startDate && endDate) {
      query.deadline = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const tasks = await Task.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    Object.assign(task, req.body);
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.deleteOne();
    res.json({ message: "Task removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
