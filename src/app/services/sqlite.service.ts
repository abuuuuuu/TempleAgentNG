import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection
} from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {
  private sqlite = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;

  constructor() {
    this.init();
  }

  async init() {
    try {
      const db = await this.sqlite.createConnection("mi_db", false, "no-encryption", 1);
      await db.open();
      this.db = db;

      await db.execute(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id INTEGER PRIMARY KEY,
          nombre TEXT
        );
      `);
    } catch (err) {
      console.error("Error al iniciar SQLite", err);
    }
  }

  async insertarUsuario(nombre: string) {
    if (!this.db) return;
    const stmt = `INSERT INTO usuarios (nombre) VALUES (?)`;
    await this.db.run(stmt, [nombre]);
  }

  async obtenerUsuarios() {
    if (!this.db) return [];
    const res = await this.db.query(`SELECT * FROM usuarios`);
    return res.values || [];
  }
}
