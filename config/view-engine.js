import hbs from 'express-handlebars';

export const initViewEngine = (app) => {
    app.engine('hbs', hbs.engine({ extname: 'hbs' }));
    app.set('view engine', 'hbs');
}