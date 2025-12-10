import Group from "#models/group";
import db from "@adonisjs/lucid/services/db";
import app from "@adonisjs/core/services/app";
import { DateTime } from "luxon";

app.ready(async () => {
  console.log("[Scheduler] Group cleanup service started...");

  const MILLISECONDS_24_HOURS = 24 * 60 * 60 * 1000;
  //const MILLISECONDS_24_HOURS = 20 * 1000;

  setInterval(async () => {
    try {
      console.log("[Scheduler] Running group cleanup job...");

      const threshold = DateTime.now().minus({ days: 30 });
      //const threshold = DateTime.now().minus({ seconds: 30 });

      // Nájdeme kanály, kde posledná správa je staršia ako 30 dní
      // alebo kanály, ktoré nemajú žiadne správy a boli vytvorené pred viac ako 30 dňami
      const inactiveGroups = await db.rawQuery(
        `
        SELECT g.id, g.name, MAX(m.created_at) as last_message_at
        FROM groups g
        LEFT JOIN messages m ON g.id = m.group_id
        GROUP BY g.id, g.name
        HAVING MAX(m.created_at) < ? OR (MAX(m.created_at) IS NULL AND g.created_at < ?)
        `,
        [threshold.toSQL(), threshold.toSQL()]
      );

      const groupsToDelete = inactiveGroups.rows || inactiveGroups;

      if (groupsToDelete.length === 0) {
        console.log("[Scheduler] No inactive groups to clean.");
        return;
      }

      const ids = groupsToDelete.map((g: any) => g.id);

      await Group.query().whereIn("id", ids).delete();

      console.log(`[Scheduler] Deleted ${ids.length} inactive groups:`);
      groupsToDelete.forEach((g: any) => {
        console.log(`  - ${g.name} (last activity: ${g.last_message_at || 'never'})`);
      });
    } catch (error) {
      console.error("[Scheduler] Cleanup job failed", error);
    }
  }, MILLISECONDS_24_HOURS);
});
