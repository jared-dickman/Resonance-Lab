import { useEffect, useState } from "react";

interface UseChordVoicingsOptions<T> {
  chordName: string | null;
  getVoicings: (chordName: string) => T[];
}

export interface UseChordVoicingsResult<T> {
  voicings: T[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  hasVoicings: boolean;
}

export function useChordVoicings<T>({
  chordName,
  getVoicings,
}: UseChordVoicingsOptions<T>): UseChordVoicingsResult<T> {
  const [voicings, setVoicings] = useState<T[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!chordName) {
      setVoicings([]);
      return;
    }

    const foundVoicings = getVoicings(chordName);
    setVoicings(foundVoicings);
    setCurrentIndex(0);
  }, [chordName, getVoicings]);

  return {
    voicings,
    currentIndex,
    setCurrentIndex,
    hasVoicings: voicings.length > 0,
  };
}
