import Agent from '../models/agent.js';

export const createAgent = async (req, res) => {
    try {
        const agent = await Agent.create(req.body);
        res.status(201).json(agent);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getAllAgents = async (_req, res) => {
    try {
        const agents = await Agent.findAll();
        res.json(agents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAgentById = async (req, res) => {
    try {
        const agent = await Agent.findByPk(req.params.id);
        if (!agent) return res.status(404).json({ error: 'Agente não encontrado' });
        res.json(agent);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateAgent = async (req, res) => {
    try {
        const agent = await Agent.findByPk(req.params.id);
        if (!agent) return res.status(404).json({ error: 'Agente não encontrado' });
        await agent.update(req.body);
        res.json(agent);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteAgent = async (req, res) => {
    try {
        const agent = await Agent.findByPk(req.params.id);
        if (!agent) return res.status(404).json({ error: 'Agente não encontrado' });
        await agent.destroy();
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
