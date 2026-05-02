import { useApp } from '@/context/AppContext';

export type UnitSystem = 'metric' | 'imperial';

export function useUnits() {
  const { profile } = useApp();
  const sys = (profile.units ?? 'metric') as UnitSystem;
  const isImperial = sys === 'imperial';

  function fmtLen(cm: number): string {
    if (isImperial) return `${(cm * 0.393701).toFixed(1)} in`;
    return `${cm.toFixed(1)} cm`;
  }

  function fmtWt(kg: number): string {
    if (isImperial) return `${(kg * 2.20462).toFixed(1)} lbs`;
    return `${kg.toFixed(1)} kg`;
  }

  function fmtHt(cm: number): string {
    if (isImperial) {
      const totalIn = cm * 0.393701;
      const ft = Math.floor(totalIn / 12);
      const inch = Math.round(totalIn % 12);
      return `${ft}'${inch}"`;
    }
    return `${Math.round(cm)} cm`;
  }

  function convertLen(cm: number): number {
    return isImperial ? parseFloat((cm * 0.393701).toFixed(1)) : parseFloat(cm.toFixed(1));
  }

  function convertWt(kg: number): number {
    return isImperial ? parseFloat((kg * 2.20462).toFixed(1)) : parseFloat(kg.toFixed(1));
  }

  const lenUnit = isImperial ? 'in' : 'cm';
  const wtUnit = isImperial ? 'lbs' : 'kg';

  return { isImperial, fmtLen, fmtWt, fmtHt, convertLen, convertWt, lenUnit, wtUnit, units: sys };
}
