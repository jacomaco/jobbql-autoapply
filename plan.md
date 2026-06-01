# Plan för att bygga en autoapply script

## Vad förväntar jag mig att programmet ska göra 
- Programmet börjar med en CV.md fil som innehåller samtilag(mest) av mina arbetslivserfarenehter.
Den ska också ha en viss grundstruktur som jag definerar på förhand. 
- CV.md ska analyseras mot jobbannonser som hämtas via api från arbetsförmedlingen (ifall dess url från paltsbanken inte har analyserats tiidigare) med hjälp av AI-agent flöde. 
- Om CVn är tillräckligt relevant (dvs CV.analysis = {match: true, reason: '...', applicationType: enum (någont som bestäms berående på hur annonsen på arbetsförmedlingen har för sätt som de vill att man ansöker på, )}).

### Data-ingestion 
- kan göras genom att hämta jobbdata från arbetsförmedlingen
(const data = await fetch('url')).filter(...) // Tänker att man borde kunna göra mycket av filtreringen direkt i api anroppet med query parameters, eg stockohlm.


- Filtrera datan och födela ut arbetsuppgifter genom att använda en generator function 
// använd interface för att definera arbetsuppgifter
interface Task {
        jobPostID: number,
        jobTitle: string,
        email: string | null,
        jobDescription: string,
        ...
    }
$$\text{AsyncGenerator}<\text{YieldType}, \text{ReturnType}, \text{NextType}>$$
async function* generateTasks(data: any): AsyncGenerator<Task, void, unknown> { 
    for (const task of tasks) {
        // Förutsatt att filter returnerar ett Task-objekt
        yield task
    }
}

## Consume tasks
async function startTasks() {
    for await (const task of generateTasks(data)) {
        if (CV.analysis.match === false) {
            // append to processedJobPostIDs <HashSet> (denna ska sparas till en fil och laddas in i minne när appen är på) använd 'Set.prototype.has()' för snabb lookup.
        } else {
            // append to processedJobPostIDs <HashSet> (denna ska sparas till en fil och laddas in i minne när appen är på) använd 'Set.prototype.has()' för snabb lookup.
            // add task to queue
        }
    }
}

enum applytype = {
        Email = 'Email',
        TeamTailor = 'TeamTailor',
        Manual = 'Manual'
        ...
    }

applicationType bestämmer vad som ska hända med CVt i nästa stadie, ex på hur man skulle kunna konfigurera nästa steg:
if (CV.applyType === applyType.Email) {
    applyConfiguration = {
        customizedCV: true,
        customizedEmail: true,
        ...
    }
}
// handera ifall det inte finns en fördefinirad applyType
if (CV.applyType === Manualnull ) {
   applyConfiguration = {
       customizedCV: true,
       coverLetter: true,
       sendManually: true
   } 
}


## Övriga ideer 
- Man skulle kunna göra så att man har olika cv-profiler med unik cv och historik övre jobben som processats, men men en check som kolla alla de sparade filtera så att man inte sckickar in flera ansökningar på samma annons, fast med ett annat cv. 
- Man kan göra så att man får en rapport på vad systemet har gjort och vilka jobb den skickat in på och med vilken cv.
För att det ska fungera CV sparas kopplat till annonsen.

## TODO 
1. implementera mongoose och schema för och test profil
