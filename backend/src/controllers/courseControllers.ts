import { Request, Response } from 'express';
import Course from '../models/Course';

export const getCourses = async (req: Request, res: Response) => {
  const courses = await Course.find();
  res.json(courses);
};

export const createCourse = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const course = new Course({ name, description });
  await course.save();
  res.status(201).json(course);
};

export const updateCourse = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const course = await Course.findByIdAndUpdate(
    id,
    { name, description },
    { new: true },
  );
  res.json(course);
};

export const deleteCourse = async (req: Request, res: Response) => {
  const { id } = req.params;
  await Course.findByIdAndDelete(id);
  res.status(204).send();
};