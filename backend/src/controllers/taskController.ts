import { Request, Response } from 'express';
import Task from '../models/Tasks';
import Submission from '../models/Submission';

export const createTask = async (req: Request, res: Response) => {
  const { title, description, dueDate } = req.body;
  const task = new Task({ title, description, dueDate });
  await task.save();
  res.status(201).json(task);
};

export const getTasks = async (req: Request, res: Response) => {
  const tasks = await Task.find();
  res.json(tasks);
};

export const submitTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { studentId, content } = req.body;
  const submission = new Submission({ taskId: id, studentId, content });
  await submission.save();
  res.status(201).json(submission);
};