/**
 * Context-aware suggestions types
 * Larry & Sergey: Keep it simple. Just the essentials.
 */

export type UserScreen = 
  | 'empty' 
  | 'viewing_property' 
  | 'search_results' 
  | 'comparing';

export interface Suggestion {
  id: string;
  text: string;
  action: string;
  icon: string;
  priority: number;
}

export interface UserContext {
  screen: UserScreen;
  propertyId?: string;
  searchQuery?: string;
}
