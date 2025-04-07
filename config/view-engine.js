import hbs from 'express-handlebars';
import path from "path";
import { fileURLToPath } from "url";

export const initViewEngine = (app) => {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);

	const hbsInstance = hbs.create({
		extname: 'hbs',
		defaultLayout: false,
		layoutsDir: path.resolve(__dirname, "..", "src", "views", "layouts"),
		partialsDir: path.resolve(__dirname, "..", "src", "views", "partials"),
		helpers: {
			eq: (a, b) => a === b,
			gte: (a, b) => a >= b
		},
		runtimeOptions: {
			allowProtoPropertiesByDefault: true,
			allowProtoMethodsByDefault: true
		}
	});

	app.engine('hbs', hbsInstance.engine);
	app.set('view engine', 'hbs');
	app.set("views", path.resolve(__dirname, "..", "src", "views"));
};