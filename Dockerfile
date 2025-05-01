# 1. Imagem base com Node.js
FROM node:18

# 2. Diretório de trabalho dentro do container
WORKDIR /app

# 3. Copia apenas os arquivos de dependência
COPY package*.json ./

# 4. Instala as dependências
RUN npm install

# 5. Copia o restante dos arquivos da aplicação
COPY . .

# 6. Expõe a porta (deve bater com o que está no docker-compose)
EXPOSE 3001

# 7. Comando padrão para rodar o app (redefinido pelo docker-compose com npm run dev)
# No lugar de npm start
CMD ["npm", "run", "dev"]

