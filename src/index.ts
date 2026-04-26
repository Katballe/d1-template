import { renderHtml } from "./renderHtml";

type Note = { id: number; author: string; message: string; created_at: string };

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		if (request.method === "POST" && url.pathname === "/notes") {
			const form = await request.formData();
			const message = (form.get("message") ?? "").toString().trim().slice(0, 1000);
			if (message) {
				await env.DB.prepare("INSERT INTO notes (author, message) VALUES (?, ?)")
					.bind("", message)
					.run();
			}
			return Response.redirect(url.origin + "/", 303);
		}

		let notes: Note[] = [];
		try {
			const { results } = await env.DB.prepare(
				"SELECT * FROM notes ORDER BY created_at DESC LIMIT 100"
			).all<Note>();
			notes = results;
		} catch {
			// notes table not yet created
		}

		return new Response(renderHtml(notes), {
			headers: { "content-type": "text/html; charset=UTF-8" },
		});
	},
} satisfies ExportedHandler<Env>;
