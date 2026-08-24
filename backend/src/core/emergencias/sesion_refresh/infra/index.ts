import { Database } from "../../../../config/database";
import { SesionRefreshRepositorySQL } from "./_sql/SesionRefreshRepositorySQL";

export const SesionRefreshRepository = new SesionRefreshRepositorySQL(Database.getInstance().models.sesionRefresh);
