import { Client } from "pg";

export class BdService {
    client!: Client;
    constructor() {}
    

    async init () {
        this.client = new Client({
            user: 'postgres',
            host: 'localhost', 
            database: 'camera',
            password: '1234', // пробуй пустой пароль
            port: 5432,
        });

        // Подключение к базе данных
        try {
            await this.client.connect();
            console.log('Connected to PostgreSQL')
        } catch (e) {
            console.error('Connection error', e) 
        }
    }

    async createUser(username: string, email: string,  token: string) {
        const result = await this.client.query(
        `INSERT INTO users (username, email, token) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, username, email, token, created_at`,
        [username, email,  token]
        );
    }
    /**
     * ищем по token_oauth
     * @param username 
     * @param email 
     * @param token - токен сгенерированный для авторизации 
     * @param token_oauth - sab гугла
     * @returns 
     */
    async criateOrSearchUser(username: string, email: string,  token: string, token_oauth: string): Promise<any> {
        const result = await this.client.query(
             `
                WITH existing AS (
                SELECT *, false as created FROM users WHERE token_oauth = $1
                ),
                inserted AS (
                INSERT INTO users (token_oauth, username, email, token)
                SELECT $1, $2, $3, $4
                WHERE NOT EXISTS (SELECT 1 FROM existing)
                RETURNING *, true as created
                )
                SELECT * FROM existing
                UNION ALL
                SELECT * FROM inserted
            `,
            [token_oauth, username, email, token]
        );
        return result;
    }

    async searchToken (token: string): Promise<any> {
        return this.client.query(
        'SELECT id, username, email, created_at FROM users WHERE token = $1',
        [token]
        );
    }


}