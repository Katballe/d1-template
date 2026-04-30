import { renderHtml } from "./renderHtml";

export default {
	async fetch(request, env) {
		return new Response(renderHtml(), {
			headers: { "content-type": "text/html; charset=UTF-8" },
		});
	},
} satisfies ExportedHandler<Env>;
