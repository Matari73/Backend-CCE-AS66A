import Subscription from '../models/subscription.js';

export const createSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.create(req.body);
        res.status(201).json(subscription);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getAllSubscriptions = async (_req, res) => {
    try {
        const subscriptions = await Subscription.findAll();
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getSubscriptionById = async (req, res) => {
    try {
        const subscription = await Subscription.findByPk(req.params.subscriptionId);
        if (!subscription) {
            return res.status(404).json({ error: 'Inscrição não encontrada' });
        }
        res.json(subscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findByPk(req.params.subscriptionId);
        if (!subscription) {
            return res.status(404).json({ error: 'Inscrição não encontrada' });
        }
        await subscription.update(req.body);
        res.json(subscription);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findByPk(req.params.subscriptionId);
        if (!subscription) {
            return res.status(404).json({ error: 'Inscrição não encontrada' });
        }
        await subscription.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
