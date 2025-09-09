import { SqliteService } from '../services/sqlite.service';

constructor(private sqliteService: SqliteService) {}

async ionViewDidEnter() {
  await this.sqliteService.insertarUsuario("Juan");
  const usuarios = await this.sqliteService.obtenerUsuarios();
  console.log(usuarios);
}
