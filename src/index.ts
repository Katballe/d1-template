import { renderHtml } from "./renderHtml";

type LoveNote = { id: number; reason: string; icon: string };

export default {
	async fetch(request, env) {
		const { results } = await env.DB.prepare("SELECT * FROM love_notes ORDER BY id").all<LoveNote>();

		return new Response(renderHtml(results), {
			headers: { "content-type": "text/html; charset=UTF-8" },
		});
	},
} satisfies ExportedHandler<Env>;
