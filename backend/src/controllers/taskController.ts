import { Request, Response, NextFunction } from 'express';
import Task from '../models/Tasks';
import Submission from '../models/Submission';
import { Task as TaskType, Submission as SubmissionType } from '../types/task';

export const createTask = async (req: Request<{}, {}, TaskType>, res: Response, next: NextFunction) => {
  try {
    const { title, description, dueDate } = req.body;
    const task = new Task({ title, description, dueDate });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks: TaskType[] = await Task.find();
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

export const submitTask = async (req: Request<{ id: string }, {}, SubmissionType>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { studentId, content } = req.body;
    const submission = new Submission({ taskId: id, studentId, content });
    await submission.save();
    res.status(201).json(submission);
  } catch (err) {
    next(err);
  }
};