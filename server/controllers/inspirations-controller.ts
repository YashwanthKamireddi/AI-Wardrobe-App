
import { Request, Response } from "express";
import storage from "../storage";

export const getInspirations = async (req: Request, res: Response) => {
    try {
        const inspirations = await storage.getInspirations();
        res.json(inspirations);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch inspirations" });
    }
};

export const getInspiration = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const inspiration = await storage.getInspiration(id);

        if (!inspiration) {
            return res.status(404).json({ message: "Inspiration not found" });
        }

        res.json(inspiration);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch inspiration" });
    }
};
