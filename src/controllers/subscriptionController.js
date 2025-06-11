import Subscription from '../models/subscription.js';
import { validateTeamComposition } from '../services/teamValidation.js';
import { validateSubscription } from '../services/subscriptionValidation.js';

export const createSubscription = async (req, res) => {
  try {
    const { championship_id, team_id } = req.body;

    const teamValidation = await validateTeamComposition(team_id);
    if (!teamValidation.valid) {
      return res.status(teamValidation.status).json({
        error: 'Time inválido',
        details: teamValidation.message
      });
    }

    // Valida regras de inscrição
    const subscriptionValidation = await validateSubscription(championship_id, team_id);
    if (!subscriptionValidation.valid) {
      return res.status(subscriptionValidation.status).json({
        error: 'Inscrição inválida',
        details: subscriptionValidation.details || subscriptionValidation.message
      });
    }

    const subscription = await Subscription.create({
      championship_id,
      team_id,
      subscription_date: req.body.subscription_date || new Date()
    });

    res.status(201).json({
      message: 'Inscrição criada com sucesso',
      subscription: {
        subscription_id: subscription.subscription_id,
        championship_id: subscription.championship_id,
        team_id: subscription.team_id
      }
    });

  } catch (error) {
    console.error('Erro ao criar inscrição:', error);
    res.status(500).json({ 
      error: 'Falha ao criar inscrição',
      details: error.message 
    });
  }
};

export const getAllSubscriptions = async (req, res) => {
    try {
        const { championship_id, team_id } = req.query;
        const where = {};
        
        if (championship_id) where.championship_id = championship_id;
        if (team_id) where.team_id = team_id;

        const subscriptions = await Subscription.findAll({ where });
        res.json({
            count: subscriptions.length,
            subscriptions
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Falha ao buscar inscrições',
            details: error.message 
        });
    }
};

export const getSubscriptionById = async (req, res) => {
    try {
        const subscription = await Subscription.findByPk(req.params.subscriptionId);
        if (!subscription) {
            return res.status(404).json({ 
                error: 'Inscrição não encontrada',
                details: `ID ${req.params.subscriptionId} não existe`
            });
        }
        res.json(subscription);
    } catch (error) {
        res.status(500).json({ 
            error: 'Falha ao buscar inscrição',
            details: error.message 
        });
    }
};

export const updateSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { championship_id, team_id } = req.body;

    const subscription = await Subscription.findByPk(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ 
        error: 'Inscrição não encontrada'
      });
    }

    // Valida se houve mudança relevante
    const teamChanged = team_id && team_id !== subscription.team_id;
    const championshipChanged = championship_id && championship_id !== subscription.championship_id;

    if (teamChanged || championshipChanged) {
      // Valida composição do time se o time foi alterado
      if (teamChanged) {
        const teamValidation = await validateTeamComposition(team_id);
        if (!teamValidation.valid) {
          return res.status(teamValidation.status).json({
            error: 'Novo time inválido',
            details: teamValidation.message
          });
        }
      }

      // Valida regras de inscrição
      const finalChampionshipId = championshipChanged ? championship_id : subscription.championship_id;
      const finalTeamId = teamChanged ? team_id : subscription.team_id;

      const validation = await validateSubscription(finalChampionshipId, finalTeamId);
      if (!validation.valid) {
        return res.status(validation.status).json({
          error: 'Inscrição inválida',
          details: validation.details || validation.message
        });
      }
    }

    await subscription.update({
      championship_id: championship_id || subscription.championship_id,
      team_id: team_id || subscription.team_id,
      subscription_date: req.body.subscription_date || subscription.subscription_date
    });

    res.json({
      message: 'Inscrição atualizada com sucesso',
      subscription
    });

  } catch (error) {
    console.error('Erro ao atualizar inscrição:', error);
    res.status(500).json({ 
      error: 'Falha ao atualizar inscrição',
      details: error.message 
    });
  }
};

export const deleteSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findByPk(req.params.subscriptionId);
        if (!subscription) {
            return res.status(404).json({ 
                error: 'Inscrição não encontrada',
                details: `ID ${req.params.subscriptionId} não existe`
            });
        }
        await subscription.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ 
            error: 'Falha ao remover inscrição',
            details: error.message 
        });
    }
};

// Endpoints especializados
export const getSubscriptionBySwitchingCode = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ 
            where: { switching_code: req.params.switchingCode } 
        });
        
        if (!subscription) {
            return res.status(404).json({ 
                error: 'Inscrição não encontrada',
                details: `Código ${req.params.switchingCode} não existe`
            });
        }
        res.json(subscription);
    } catch (error) {
        res.status(500).json({ 
            error: 'Falha ao buscar inscrição por código',
            details: error.message 
        });
    }
};

export const updateSubscriptionScore = async (req, res) => {
    try {
        const subscription = await Subscription.findByPk(req.params.subscriptionId);
        if (!subscription) {
            return res.status(404).json({ 
                error: 'Inscrição não encontrada',
                details: `ID ${req.params.subscriptionId} não existe`
            });
        }

        const newScore = typeof req.body.score === 'number' 
            ? req.body.score 
            : subscription.score + (req.body.points || 0);
        
        await subscription.update({ score: newScore });
        res.json({
            message: 'Pontuação atualizada com sucesso',
            subscription_id: subscription.subscription_id,
            team_id: subscription.team_id,
            new_score: newScore
        });
    } catch (error) {
        res.status(400).json({ 
            error: 'Falha ao atualizar pontuação',
            details: error.message 
        });
    }
};