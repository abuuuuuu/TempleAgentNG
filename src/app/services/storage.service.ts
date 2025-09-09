// src/app/services/storage.service.ts
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

  /**
   * Guarda un objeto JSON como string
   * @param key Clave para identificar el dato
   * @param value Objeto o dato a guardar
   */
  async set(key: string, value: any): Promise<void> {
    await Preferences.set({
      key,
      value: JSON.stringify(value),
    });
  }

  /**
   * Recupera el objeto almacenado
   * @param key Clave del dato
   * @returns Objeto o null si no existe
   */
  async get<T = any>(key: string): Promise<T | null> {
    const { value } = await Preferences.get({ key });
    return value ? JSON.parse(value) : null;
  }

  /**
   * Elimina un dato guardado
   * @param key Clave del dato
   */
  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  }

  /**
   * Limpia toda la "base de datos"
   */
  async clear(): Promise<void> {
    await Preferences.clear();
  }
}
