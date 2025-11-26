import Group from "#models/group";
// import Message from "#models/message";
import app from "@adonisjs/core/services/app";
import { DateTime } from "luxon";

app.ready(async () => {
  console.log("[Scheduler] Group cleanup service started...");

  const MILLISECONDS_24_HOURS = 24 * 60 * 60 * 1000;

  setInterval(async () => {
    try {
      console.log("[Scheduler] Running group cleanup job...");

      const threshold = DateTime.now().minus({ days: 30 });

      const oldGroups = await Group.query().whereNotIn(
        "id",
        (q) =>
          q.select("group_id")
            .from("messages")
            .where("created_at", ">", threshold.toSQL()),
      );

      if (oldGroups.length === 0) {
        console.log("[Scheduler] No groups to clean.");
        return;
      }

      const ids = oldGroups.map((g) => g.id);

      await Group.query().whereIn("id", ids).delete();

      console.log(`[Scheduler] Deleted ${ids.length} inactive groups.`);
    } catch (error) {
      console.error("[Scheduler] Cleanup job failed", error);
    }
  }, MILLISECONDS_24_HOURS);
});
