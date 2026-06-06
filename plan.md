# Projektplan: Jobbql (Auto-Apply Script)

## 🎯 Vision & Flöde

Programmet ska automatisera jobbsökningsprocessen. Det utgår från en basprofil (t.ex. en `CV.md` med arbetslivserfarenhet) och matchar denna mot inkommande annonser via ett AI-agent-flöde.

1. **Hämta:** Plocka relevanta jobbannonser från Arbetsförmedlingen (JobTech Dev API).
2. **Analysera:** Jämför annonsen mot användarens profil/CV med hjälp av en lokal LLM (t.ex. Ollama).
3. **Beslut:** Bedöm om det är en match. Om "Ja", bestäm hur ansökan ska ske (`ApplyType`).
4. **Generera & Köa:** Generera ett anpassat CV/personligt brev och lägg ansökan i en kö för slutlig hantering.

---

## 🏗 Arkitektur & Datamodell

### Databas (MongoDB + Mongoose)

Vi använder en lokal MongoDB för att hantera tillstånd, relationer och förhindra dubbletter.

* **Modeller:** `User`, `Profile`, `JobPost` och `Application`.
* **Dubblettskydd:** En unik sammansatt indexering på `userId` + `jobPostId` garanterar att systemet aldrig analyserar eller skickar in en ansökan till samma jobb två gånger för samma användare.
* *Tidigare tanke om HashSet sparad i fil är skrotad till förmån för direkta MongoDB `.exists()`-frågor.*

### Arbetsflöde (Data Ingestion & Processing)

Jobb hämtas in via `afService` och matas in i systemet via en asynkron generator-funktion (`generateTasks`) för att kunna bearbeta stora mängder annonser smidigt.

```typescript
async function* generateTasks(data: JobPost[]): AsyncGenerator<JobPost, void, unknown> {
    for (const job of data) {
        yield job;
    }
}

```

### Konfiguration av Ansökan (`ApplyType`)

Beroende på vad AI:n eller annonsen definierar genereras en anpassad konfiguration för nästa steg i kön:

* **Email:** Generera anpassat CV + personligt mailutkast.
* **TeamTailor:** Generera anpassat CV för automatisk uppladdning.
* **Manual:** Generera CV och personligt brev, förbered för att användaren själv skickar in.

---

## 📝 TODO / Roadmap

### Faser som är klara (✔)

* [x] Sätt upp grundläggande projektstruktur med TypeScript och Bun.
* [x] Konfigurera och starta lokal MongoDB via Docker Compose.
* [x] Skapa databasmodeller med Mongoose och TypeScript-interfaces (User, Profile, JobPost, Application).
* [x] Bygg huvud-workflow (`workflow.ts`) med logik för att blockera dubbletter via databasen.
* [ ] Implementera robust test-flöde Med Bun testrunner.

### Aktuella / Nästa steg (🚀)

* [ ] **Data Ingestion:** Integrera skarpt mot Arbetsförmedlingens API (JobTech Dev) i `afService.ts`. Hantera paginering och sökparametrar (t.ex. nyckelord, ort).
- användbara länkar till apin:
https://gitlab.com/arbetsformedlingen/job-ads/getting-started-code-examples/jobstream-example/-/blob/main/settings.py?ref_type=heads
https://gitlab.com/arbetsformedlingen/job-ads/jobsearch-apis/-/blob/main/docs/GettingStartedJobSearchEN.md
https://jobsearch.api.jobtechdev.se/
https://jobstream.api.jobtechdev.se/ !!

* [ ] **AI-motorn:** Sätt upp Ollama lokalt. Implementera riktig anropslogik i `aiService.ts` som matar in base-CV och jobbannons, och tvingar ut strukturerad JSON (Match? + Reason + ApplyType) samt ett skräddarsytt Markdown-CV.
* [ ] **Kö & Leverans:** Utveckla `queue.ts` så att den kan konvertera det färdiga Markdown-dokumentet till en snygg PDF.
* [ ] Migrera till node.js eller annnan runtime som har support för playwright (Bun verkar inte ha det).
* [ ] Annonser med positiv matching, men som AI:n inte kan avgöra hur den ska ansöka ska sparas och rangårdnas efter bäst matching. 
### Framtida idéer (🌟)

* Fleranvändarstöd med unika profiler.
* Generera en visuell rapport/dashboard över vad systemet har gjort (vilka jobb sökta, vilken `ApplyType` valdes).
* Möjlig pivot/integration: Sätt in denna logik som en "Sourcing-motor" i projektet *Star Match*.
* Om man vill ha en TeamTailor version skulle man kanske kunna göra som så att man läser av företag.carrers där formuläret finns, sickar vidar det till en lättare llm. Som i sin ture genererar playwright-kod som filler i formuläret.

---
