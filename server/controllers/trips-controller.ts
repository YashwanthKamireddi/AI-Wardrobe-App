
import { Request, Response } from "express";
import { z } from "zod";
import storage from "../storage";
import { insertTripSchema } from "@shared/schema";
import { createLogger } from "../utils/logger";

const logger = createLogger('trips-controller');

export const getTrips = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const trips = await storage.getTrips(req.user!.id);
        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch trips" });
    }
};

export const createTrip = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        logger.debug({ body: req.body }, "[createTrip] Received request");

        const tripData = insertTripSchema.parse({
            ...req.body,
            userId: req.user!.id
        });

        logger.debug({ tripData }, "[createTrip] Parsed data");

        const trip = await storage.createTrip(tripData);
        logger.info({ tripId: trip.id, userId: req.user!.id }, "[createTrip] Trip created successfully");

        res.status(201).json(trip);
    } catch (error) {
        logger.error({ err: error }, "[createTrip] Error creating trip");
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid trip data", errors: error.format() });
        }
        res.status(500).json({ message: "Failed to create trip" });
    }
};

export const updateTrip = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const id = parseInt(req.params.id);
        const trip = await storage.getTrip(id);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        if (trip.userId !== req.user!.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const updatedTrip = await storage.updateTrip(id, req.body);
        res.json(updatedTrip);
    } catch (error) {
        res.status(500).json({ message: "Failed to update trip" });
    }
};

export const deleteTrip = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const id = parseInt(req.params.id);
        const trip = await storage.getTrip(id);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        if (trip.userId !== req.user!.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await storage.deleteTrip(id);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: "Failed to delete trip" });
    }
};
