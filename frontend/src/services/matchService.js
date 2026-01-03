// matchService.js - UPDATED VERSION
import api from '../utils/api.js';

// List matches
export const listMatches = async () => {
  try {
    const response = await api.get('/matches/list');
    return response.data.matches || []; // Return matches array, not full response
  } catch (error) {
    console.error('Error listing matches:', error);
    throw error;
  }
};

// Create match - FIXED
export const createMatch = async (stake, matchType) => {
  try {
    const response = await api.post('/matches/create', {
      stake: Number(stake),
      matchType: matchType || 'tictactoe' // Changed from gameType to matchType
    });
    return response.data.match || response.data; // Return match object
  } catch (error) {
    console.error('Error creating match - Details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

// Join match - FIXED
export const joinMatch = async (matchCode) => {
  try {
    const response = await api.post('/matches/join', { 
      matchCode: matchCode.toString().trim().toUpperCase() 
    });
    return response.data.match || response.data; // Return match object
  } catch (error) {
    console.error('Error joining match - Details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};