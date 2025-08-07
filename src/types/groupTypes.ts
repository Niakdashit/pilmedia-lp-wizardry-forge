// Types pour le système de groupes d'éléments (inspiré de Canva)

export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'group';
  x: number;
  y: number;
  width?: number;
  height?: number;
  // Propriétés spécifiques selon le type
  content?: string; // pour les textes
  src?: string; // pour les images
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  // Propriétés de groupe
  parentGroupId?: string; // ID du groupe parent si l'élément est dans un groupe
  groupChildren?: string[]; // IDs des éléments enfants si c'est un groupe
  isGroup?: boolean;
  // Métadonnées
  name?: string; // Nom affiché dans les calques
  visible?: boolean;
  locked?: boolean;
  zIndex?: number;
}

export interface ElementGroup {
  id: string;
  type: 'group';
  name: string;
  children: string[]; // IDs des éléments dans le groupe
  x: number; // Position du groupe (calculée à partir des enfants)
  y: number;
  width: number; // Dimensions du groupe (calculées à partir des enfants)
  height: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  parentGroupId?: string; // Pour les groupes imbriqués
}

export interface LayerItem {
  id: string;
  type: 'element' | 'group';
  name: string;
  visible: boolean;
  locked: boolean;
  isExpanded?: boolean; // Pour les groupes dans la liste des calques
  parentId?: string;
  children?: LayerItem[];
}

export interface GroupSelection {
  type: 'single' | 'multiple' | 'group';
  elementIds: string[];
  groupId?: string;
}

export interface GroupBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  elements: CanvasElement[];
}

// Actions pour la gestion des groupes
export type GroupAction = 
  | { type: 'CREATE_GROUP'; elementIds: string[]; groupName?: string }
  | { type: 'UNGROUP'; groupId: string }
  | { type: 'ADD_TO_GROUP'; groupId: string; elementIds: string[] }
  | { type: 'REMOVE_FROM_GROUP'; groupId: string; elementIds: string[] }
  | { type: 'SELECT_GROUP'; groupId: string }
  | { type: 'EDIT_GROUP_ELEMENT'; groupId: string; elementId: string }
  | { type: 'MOVE_GROUP'; groupId: string; deltaX: number; deltaY: number }
  | { type: 'RESIZE_GROUP'; groupId: string; bounds: GroupBounds };
