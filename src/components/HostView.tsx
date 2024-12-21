import React, { useState, useEffect, useRef } from 'react';
import { Play, Eye, Trophy } from 'lucide-react';
import { calculateBounds } from '../lib/mapUtils';
import QuestionCard from './QuestionCard';
import PlayerList from './PlayerList';
import MapComponent from './MapComponent';
import type { MapRef } from '../types/map';

// ... (keep existing interfaces)

export default function HostView({
  gameId,
  currentQuestion,
  players,
  answers: propAnswers,
  onNextQuestion,
  onRevealAnswers,
  question
}: HostViewProps) {
  const [showingAnswers, setShowingAnswers] = useState(false);
  const [displayedAnswers, setDisplayedAnswers] = useState<Answer[]>([]);
  const [isRevealing, setIsRevealing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealComplete, setRevealComplete] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const mapRef = useRef<MapRef>(null);

  const allPlayersAnswered = players.length > 0 && players.every(p => p.has_answered);
  const isLastQuestion = currentQuestion === 4; // Adjust to 4 since we're 0-based

  // ... (keep existing useEffect for reset)

  const revealAnswersSequentially = async () => {
    if (!mapRef.current) return;

    try {
      console.log('Current question:', currentQuestion);
      console.log('All answers:', propAnswers);
      
      // Get all answers for the current question - use currentQuestion directly since it's 0-based
      const relevantAnswers = propAnswers
        .filter(a => a.question_id === currentQuestion)
        .sort((a, b) => b.score - a.score);

      console.log('Relevant answers:', relevantAnswers);

      // First, fly to the correct location
      mapRef.current.flyTo({
        center: [question.longitude, question.latitude],
        zoom: 5,
        duration: 2000
      });

      // Wait for the fly animation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Show all answers
      setDisplayedAnswers(relevantAnswers);

      // Calculate bounds to show all markers
      if (relevantAnswers.length > 0) {
        const bounds = calculateBounds([
          [question.longitude, question.latitude],
          ...relevantAnswers.map(a => [a.longitude, a.latitude])
        ]);

        // Animate to show all markers
        mapRef.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          duration: 2000
        });
      }

      setRevealComplete(true);
    } catch (err) {
      console.error('Error revealing answers:', err);
      setError('Failed to reveal answers');
    }
  };

  // ... (keep rest of the component the same)
}