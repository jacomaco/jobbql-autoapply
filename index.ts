interface Task {
    jobPostID: number;
    jobTitle: string;
    email: string | null;
    jobDescription: string;
    CVId: number; 
    // ...
}

enum ApplyType {
    Email = 'Email',
    TeamTailor = 'TeamTailor',
    Manual = 'Manual',
    Unknown = 'Unknown' // Används om AI:n inte kan avgöra
}

function determineApplyConfiguration(type: ApplyType) {
    switch (type) {
        case ApplyType.Email:
            return { customizedCV: true, customizedEmail: true };
        
        case ApplyType.Manual:
            // Vad som händer om en människa ska lämna in manuellt
            return { customizedCV: true, coverLetter: true, sendManually: true };
            
        case ApplyType.Unknown:
        default:
            // Din fallback om något är otydligt eller om AI returnerar strunt
            return { customizedCV: true, coverLetter: true, sendManually: true };
    }
}

async function fetchJobAdsFromArbetsformedlingen() {
    throw new Error("Function not implemented."); // kolla om detta är vär t att använda: https://bun.com/docs/runtime/networking/fetch#streaming-response-bodies, kan vara interessant ifall man inte behöver använda AsyncGenerator då?
}

async function* generateTasks(data: any): AsyncGenerator<Task, void, unknown> { // TODO: ta reda på vad det är för datatyp som matas it. se rawData. 
    for (const task of data) {
        yield task
    }
}

async function startWorkflow(cvText: string) {
    // 1. Hämta datan från AF (gärna filtrerad via query params)
    const rawData = await fetchJobAdsFromArbetsformedlingen();
    
    // 2. Strömma uppgifterna via generator. Alternativs via bun stream.
    for await (const task of generateTasks(rawData)) {
        
        // KONTROLL 1: Har detta jobb hanteras tidigare?
        if (processedJobPostIDs.has(task.jobPostID)) {
            continue; // Hoppa över direkt, gå till nästa jobb
        }

        // 3. AI-AGENT ANALYS: Skicka CV.md + jobbannons till AI
        const analysis = await analyzeJobWithAI(cvText, task.jobDescription); // Implementera mock function så jag kan implementera början av programmet innan jag behöver oroa mig över api kostnader.
        
        // KONTROLL 2: Matchar jobbet ditt CV?
        if (analysis.match === false) {
            // Spara id så vi slipper analysera det igen nästa gång skriptet körs
            processedJobPostIDs.add(task.jobPostID);
            await saveHashSetToFile(processedJobPostIDs); 
            continue; 
        }

        // 4. MATCH! Lägg till i kön för ansökningar
        processedJobPostIDs.add(task.jobPostID);
        await saveHashSetToFile(processedJobPostIDs); // add error handeling
        // TODO: lägg också till möjlighet att spara ett genererat cv till en annons for en användara (inte för en användares cv profil eftersom en användare ska inte kunna söka på samma jobb med olika CVn).
        // TODO: Använd en ricktig databas med jobPostID som primarykey och som join mellan cv och CVId, efter jag fått ihop grund funktionaliteten med att hämta api data, läsa cv i minne. Tänker att man borde kunna använd asocker för att köra databasen ibörjan.

        // Skapa konfigurationen baserat på vad AI:n kom fram till för applyType
        const config = determineApplyConfiguration(analysis.applicationType);
        
        // Lägg till i arbetskvalificerade kö (t.ex. Bull, Bee-Queue eller bara en array)
        await applicationQueue.add({ task, config });
    }
}

// ============================================================================
// StartProgram
// ============================================================================

// 1. Läs in CV.md
const cvFile = Bun.file("CV.md");
const cvText = await cvFile.text(); 
console.log(`Läst in CV (${cvText.length} tecken)`);

startWorkflow(cvText)
// const processedJobPostIDs = new Set<number>();
//
// // Spara till fil med Bun.write
// async function saveIDs() {
//     const arrayForm = Array.from(processedJobPostIDs);
//     await Bun.write("processed_ids.json", JSON.stringify(arrayForm));
// }
//
// // Ladda från fil
// const idFile = Bun.file("processed_ids.json");
// if (await idFile.exists()) {
//     const ids: number[] = await idFile.json();
//     ids.forEach(id => processedJobPostIDs.add(id));
// }
