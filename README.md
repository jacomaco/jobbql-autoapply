Här är texten formaterad med korrekt Markdown-syntax:

# Jobbql (Auto-Apply Pipeline)

Ett automationsverktyg byggt i TypeScript och Bun för att hämta jobbannonser, analysera dem mot en kandidats profil med hjälp av AI, och automatiskt generera skräddarsydda CV:n och ansökningsuppgifter.

## 🛠 Förutsättningar

* [Bun](https://bun.sh/) (JavaScript runtime)
* [Docker & Docker Compose](https://www.docker.com/) (För lokal MongoDB)
* En lokal AI-motor (t.ex. Ollama) *[Kommande]*

## 🚀 Kom igång

### 1. Installera beroenden

```bash
bun install

```

### 2. Konfigurera miljövariabler

Skapa en `.env`-fil och lägg till följande:

```env
DB_USER=admin
DB_PASSWORD=ditt_hemliga_lösenord

```

### 3. Starta databasen

```bash
docker compose up -d

```

### 4. Kör programmet

```bash
bun start

```

## 📂 Projektstruktur

* **`src/models/`** - Mongoose databasmodeller (User, Profile, Application, JobPost).
* **`src/services/`** - Integrationer mot externa tjänster (Arbetsförmedlingen, AI, Kö-hantering).
* **`src/utils/workflow.ts`** - Huvudlogiken för att processa annonser.
* **`src/index.ts`** - Startpunkt och testkörning.
