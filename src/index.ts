import { renderHtml } from "./renderHtml";

type Note = { id: number; author: string; message: string; created_at: string };

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		if (request.method === "POST" && url.pathname === "/notes") {
			const form = await request.formData();
			const author = (form.get("author") ?? "").toString().trim().slice(0, 60);
			const message = (form.get("message") ?? "").toString().trim().slice(0, 1000);
			if (author && message) {
				await env.DB.prepare("INSERT INTO notes (author, message) VALUES (?, ?)")
					.bind(author, message)
					.run();
			}
			return Response.redirect(url.origin + "/", 303);
		}

		const { results: notes } = await env.DB.prepare(
			"SELECT * FROM notes ORDER BY created_at DESC LIMIT 100"
		).all<Note>();

		return new Response(renderHtml(notes), {
			headers: { "content-type": "text/html; charset=UTF-8" },
		});
	},
} satisfies ExportedHandler<Env>;
