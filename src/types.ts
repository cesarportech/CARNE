export interface Participant {
  id: string;
  name: string;
  hasPlayed: boolean;
  assignedItem?: string;
  assignedOption?: string; // e.g. 'Coca-Cola', 'Pepsi', 'Sabores' for Fresco
  pendingDrink?: boolean;  // le tocó Fresco pero aún no elige bebida: sigue habilitado
  photoUrl?: string;
  photoIndex?: number;
  completedAt?: number;
}

export interface ItemDefinition {
  id: string;
  name: string;
  totalSlots: number;
  emoji: string;
  color: string;
  badgeColor: string;
  description: string;
}

