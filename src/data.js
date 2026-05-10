window.Claira = window.Claira || {};

window.Claira.ANTHROPIC_API_KEY = ''; // Remplis ta clé API ici

window.Claira.QUESTIONS = [
  { id:'emotion',   text:"Comment tu te sens\nen ce moment ?",      sub:"Il n'y a pas de mauvaise réponse.", options:[{l:"Débordé·e"},{l:"Anxieux·se"},{l:"Triste"},{l:"Épuisé·e"},{l:"Perdu·e"},{l:"Tendu·e"}] },
  { id:'duration',  text:"Depuis combien de\ntemps tu ressens ça ?", sub:null, options:[{l:"Quelques jours"},{l:"Quelques semaines"},{l:"Plusieurs mois"},{l:"Depuis longtemps"}] },
  { id:'impact',    text:"Est-ce que ça impacte\nton quotidien ?",    sub:null, options:[{l:"Oui, beaucoup"},{l:"Un peu"},{l:"Pas vraiment"}] },
  { id:'goal',      text:"Ce que tu cherches\navant tout ?",          sub:null, options:[{l:"Comprendre"},{l:"Me sentir mieux"},{l:"Traverser une période"},{l:"Travailler en profondeur"}] },
  { id:'constraint',text:"As-tu des contraintes\nparticulières ?",    sub:null, options:[{l:"Budget serré"},{l:"Peu de temps"},{l:"En ligne"},{l:"Pas de contrainte"}] },
  { id:'style',     text:"Tu préfères quelqu'un\nqui…",              sub:null, options:[{l:"M'écoute"},{l:"M'aide à agir"},{l:"Explore en profondeur"},{l:"Peu importe"}] },
];

window.Claira.THERAPIES = [
  { id:'tcc',       name:"Thérapie cognitive\net comportementale", short:"TCC",       tagline:"Pensées · Comportements · Résultats", desc:"Aide à identifier et modifier les schémas qui alimentent le mal-être. Orientée résultats, concrète.",    benefits:["Outils pratiques dès le début","Efficace sur anxiété et dépression","Résultats en quelques séances"],          constraints:["Engagement actif requis","Moins orientée passé"],                        duration:"12–20 séances", hue:"260" },
  { id:'humaniste', name:"Thérapie\nhumaniste",                    short:"Humaniste", tagline:"Écoute · Présent · Croissance",       desc:"Centrée sur toi, ton ressenti, ton potentiel. Tu es expert de ta propre vie, le thérapeute t'accompagne.", benefits:["Espace de parole bienveillant","Renforce l'estime de soi","Aucune rigidité"],              constraints:["Progrès parfois plus lents","Moins adapté aux crises"],                   duration:"Variable",       hue:"175" },
  { id:'emdr',      name:"EMDR",                                   short:"EMDR",      tagline:"Trauma · Mémoire · Libération",       desc:"Stimulations bilatérales pour traiter des souvenirs douloureux. Très efficace sur les traumatismes.",    benefits:["Efficace sur traumatismes","Résultats rapides","Moins de mots, plus de ressenti"], constraints:["Peut être intense","Praticien certifié nécessaire"],                    duration:"6–12 séances",   hue:"310" },
];

window.Claira.THERAPISTS = [
  { id:1, name:"Sophie Marchand",  title:"Psychologue clinicienne", specialty:"TCC · Anxiété · Burnout",                price:70, distance:"1.2 km", online:true,  score:96, matchReason:"Approche TCC, disponible en ligne", initials:"SM", hue:"260", years:9,
    bio:"Sophie accompagne des personnes en burnout et anxiété depuis 9 ans, avec une approche TCC adaptée à chaque parcours.",
    approach:"Première séance libre — on explore ensemble ce qui t'amène, sans pression ni cadre rigide.",
    session:["Accueil et mise en confiance","Exploration de ta situation","Identification des objectifs","Outils pratiques"],
    reviews:[{author:"Alice R.", text:"M'a aidée à sortir d'un burnout en douceur.", stars:5},{author:"Théo M.", text:"Outils concrets, soulagement rapide.", stars:5}] },
  { id:2, name:"Laurent Bessière", title:"Psychothérapeute",       specialty:"Humaniste · Relations · Identité",       price:65, distance:"2.8 km", online:false, score:88, matchReason:"Transitions de vie, approche douce",  initials:"LB", hue:"175", years:14,
    bio:"Laurent travaille sur les transitions de vie et les relations difficiles. Son approche humaniste crée un espace de liberté totale.",
    approach:"Chaque séance suit ton rythme — aider à mieux se comprendre, sans jugement.",
    session:["Espace libre de parole","Exploration des ressentis","Liens avec ton histoire","Confiance en soi"],
    reviews:[{author:"Camille L.", text:"Quelqu'un qui m'écoute vraiment.", stars:5}] },
  { id:3, name:"Inès Touati",      title:"Psychologue · EMDR",     specialty:"Trauma · Stress post-traumatique",       price:80, distance:"3.5 km", online:true,  score:81, matchReason:"EMDR, si une expérience difficile est en cause", initials:"IT", hue:"310", years:7,
    bio:"Inès est spécialisée dans les traumatismes. Elle combine EMDR et thérapie narrative.",
    approach:"Les premières séances évaluent ensemble si l'EMDR est adapté.",
    session:["Évaluation initiale","Préparation","Traitement","Intégration"],
    reviews:[{author:"Marc V.", text:"Des résultats que je n'espérais plus.", stars:5},{author:"Sarah B.", text:"Très professionnelle, travail en profondeur.", stars:4}] },
];

window.Claira.getInsight = function getInsight(answers) {
  const e = answers.emotion || '';
  const impact = answers.impact || '';
  const duration = answers.duration || '';

  if (e==="Anxieux·se"||e==="Tendu·e") return {
    label: "De l'anxiété qui prend de la place",
    text: "L'anxiété chronique s'auto-alimente : les pensées s'emballent, le corps suit. Ce n'est pas un manque de volonté — c'est un cycle qui s'est installé, probablement progressivement. La bonne nouvelle : c'est quelque chose de vraiment travaillable.",
    process: "La TCC donne des outils concrets pour identifier et interrompre ces spirales — pas besoin de tout comprendre d'un coup. Beaucoup de personnes voient une différence significative en 8 à 12 séances. La première étape, c'est juste une conversation exploratoire, sans engagement.",
    therapy:'tcc'
  };
  if (e==="Épuisé·e"||e==="Débordé·e") return {
    label: "Un épuisement qui mérite attention",
    text: "Ce que tu décris ressemble à un épuisement des ressources — pas juste de la fatigue. Quand on donne beaucoup sans pouvoir recharger, le corps et l'esprit finissent par envoyer des signaux forts. C'est un signe à prendre au sérieux, pas à minimiser.",
    process: "Avant de chercher des solutions, il y a souvent besoin d'un espace pour juste nommer ce qui se passe. Un thérapeute peut t'aider à identifier ce qui te vide, comprendre pourquoi, et trouver progressivement un équilibre qui te ressemble. Ce n'est pas un luxe — c'est une étape concrète.",
    therapy:'tcc'
  };
  if (e==="Triste") return {
    label: "Une tristesse qui s'installe",
    text: "La tristesse persistante, ce n'est pas juste « avoir le cafard ». Elle peut signaler un deuil, une perte de sens, un besoin profond de reconnexion à soi. Elle mérite d'être entendue — pas gérée ou mise de côté.",
    process: "Une thérapie centrée sur l'écoute peut faire beaucoup : pas pour t'expliquer ce que tu ressens, mais pour t'aider à te l'approprier. Souvent, être vraiment entendu·e par quelqu'un de formé suffit à déclencher quelque chose d'important.",
    therapy:'humaniste'
  };
  if (e==="Perdu·e") return {
    label: "Un besoin de repères et de sens",
    text: "Se sentir perdu·e, c'est souvent le signe d'une transition — quelque chose change, ou doit changer. Ce n'est pas un problème à résoudre mais un état à traverser. Et on traverse mieux quand on n'est pas seul·e.",
    process: "Un accompagnement thérapeutique peut t'aider à démêler ce qui se joue, retrouver tes propres repères et avancer à ton rythme. Pas de réponses toutes faites — juste un espace pour explorer.",
    therapy:'humaniste'
  };
  return {
    label: "Quelque chose mérite d'être exploré",
    text: "Ce que tu vis est réel et mérite d'être pris au sérieux. Même sans pouvoir tout nommer précisément, ressentir le besoin d'en parler est en soi un signal important.",
    process: "La première séance est souvent une exploration libre — pas de structure imposée, juste l'occasion de voir si le courant passe. C'est sans engagement, et souvent plus simple que ce qu'on imaginait.",
    therapy:'humaniste'
  };
};

window.Claira.generateAIInsight = async function generateAIInsight(answers) {
  const fallback = window.Claira.getInsight(answers);
  const key = window.Claira.ANTHROPIC_API_KEY;
  if (!key) return { ...fallback };

  const labels = { emotion:'Émotion', duration:'Durée', impact:'Impact quotidien', goal:'Objectif', constraint:'Contraintes', style:'Style de thérapeute' };
  const answersText = Object.entries(answers).map(([k, v]) => `- ${labels[k] || k} : ${v}`).join('\n');

  const prompt = `Tu es Claira, une application bienveillante d'orientation thérapeutique. Un utilisateur vient de répondre à un questionnaire. Voici ses réponses :\n${answersText}\n\nGénère un résumé empathique et naturel en JSON avec exactement ces 3 champs :\n- "label" : titre court (5-8 mots max), doux et direct\n- "text" : 2-3 phrases qui reflètent ce que vit la personne, ton chaleureux, vraiment personnalisé à ses réponses\n- "process" : 2-3 phrases sur comment la thérapie peut aider, ton encourageant et concret\n\nRéponds UNIQUEMENT avec le JSON valide, rien d'autre.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 450,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    if (!res.ok) return { ...fallback };
    const data = await res.json();
    const raw = data.content?.[0]?.text || '';
    const parsed = JSON.parse(raw);
    return {
      label:   parsed.label   || fallback.label,
      text:    parsed.text    || fallback.text,
      process: parsed.process || fallback.process,
      therapy: fallback.therapy,
    };
  } catch {
    return { ...fallback };
  }
};

