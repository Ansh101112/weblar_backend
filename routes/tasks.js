const express = require("express");
const axios = require("axios");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.use(authMiddleware);

// Create a Task
router.post("/", async (req, res) => {
  const { title, description, city } = req.body;

  if (!title || !description || !city) {
    return res
      .status(400)
      .json({ error: "All fields are required (title, description, city)." });
  }

  try {
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}`
    );

    const weather =
      weatherResponse.data.weather[0]?.description ||
      "Weather data unavailable";
    const task = new Task({
      title,
      description,
      city,
      weather,
      userId: req.user.id,
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error.message);
    res
      .status(500)
      .json({ error: "Failed to create task. Please try again later." });
  }
});

// Get All Tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error.message);
    res
      .status(500)
      .json({ error: "Failed to fetch tasks. Please try again later." });
  }
});

// Get a Task by ID
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Error fetching task:", error.message);
    res
      .status(500)
      .json({ error: "Failed to fetch task. Please try again later." });
  }
});

// Update a Task
router.put("/:id", async (req, res) => {
  const { title, description, city } = req.body;

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    if (city) {
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}`
      );
      task.weather =
        weatherResponse.data.weather[0]?.description || task.weather;
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.city = city || task.city;

    await task.save();
    res.status(200).json(task);
  } catch (error) {
    console.error("Error updating task:", error.message);
    res
      .status(500)
      .json({ error: "Failed to update task. Please try again later." });
  }
});

// Delete a Task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    console.error("Error deleting task:", error.message);
    res
      .status(500)
      .json({ error: "Failed to delete task. Please try again later." });
  }
});

module.exports = router;
