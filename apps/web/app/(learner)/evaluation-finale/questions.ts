import type { QuizQuestion } from "@formations-ia/shared-types"

export const finalQuizQuestions: QuizQuestion[] = [
  // MODULE 1 — Q1-3
  {
    id: "final-q1",
    question:
      "Une ESN remporte un contrat pour moderniser le système de recherche documentaire interne d'un groupe d'audit. Le client souhaite que ses auditeurs puissent interroger en langage naturel 12 ans d'archives de missions. Le responsable technique hésite entre trois profils : un ML Engineer spécialisé en NLP, un AI Engineer, ou un Full-Stack senior ayant déjà intégré des APIs IA. Quel profil est le plus adapté ?",
    options: [
      { label: "A", text: "Le ML Engineer NLP — il maîtrise les modèles de traitement du langage" },
      {
        label: "B",
        text: "Le Full-Stack senior — il a déjà intégré des APIs IA et peut livrer rapidement",
      },
      {
        label: "C",
        text: "L'AI Engineer — il est capable de concevoir l'architecture complète (indexation, retrieval, génération, monitoring) en orchestrant des modèles existants autour des données métier du client",
      },
      {
        label: "D",
        text: "Une combinaison ML Engineer + Full-Stack — les deux compétences sont nécessaires",
      },
    ],
    correctAnswer: "C",
    explanation:
      "Le besoin est un système RAG complet sur base documentaire privée — c'est le cas d'usage canonique de l'AI Engineering. Le ML Engineer est sur-calibré pour la partie modèle (il n'y a pas de modèle à entraîner) et sous-calibré pour l'architecture globale. Le Full-Stack peut intégrer une API mais ne sait pas concevoir la stratégie de chunking, le retrieval hybride, le pipeline d'évaluation ou le monitoring de qualité.",
  },
  {
    id: "final-q2",
    question:
      "Une ESN présente son offre IA à un CODIR. Le directeur commercial glisse : \"Notre concurrent a un assistant qui connaît des données sectorielles très précises sur notre marché. Vous pouvez faire pareil ?\" L'AI Engineer sait que ces données sectorielles sont confidentielles et n'ont jamais été publiées. Quelle est la réponse techniquement correcte ?",
    options: [
      {
        label: "A",
        text: '"Oui, en finetuning le modèle sur vos données sectorielles, il les intégrera définitivement dans sa mémoire."',
      },
      {
        label: "B",
        text: "\"Non, les Foundation Models ne peuvent pas traiter des données confidentielles — c'est une limitation intrinsèque à l'architecture.\"",
      },
      {
        label: "C",
        text: "\"Ce que vous avez vu repose probablement sur un système RAG : les données sectorielles sont indexées dans une base documentaire, et le modèle les consulte à chaque requête plutôt que de les avoir 'mémorisées'.\"",
      },
      {
        label: "D",
        text: '"Pour des données aussi sensibles, il faut entraîner un modèle custom de zéro — c\'est la seule façon de garantir la confidentialité."',
      },
    ],
    correctAnswer: "C",
    explanation:
      'La réponse correcte décrit précisément le mécanisme RAG de façon accessible à un CODIR. A est techniquement possible mais inadapté : le finetuning ne "mémorise" pas les données de façon fiable et pose des problèmes de mise à jour. B est faux : les Foundation Models traitent parfaitement les données confidentielles via le RAG. D est disproportionné et coûteux.',
  },
  {
    id: "final-q3",
    question:
      "Lors d'un cadrage, un client annonce vouloir un \"assistant IA comme ChatGPT\" pour ses équipes. L'AI Engineer comprend que la demande cache en réalité trois besoins distincts : répondre aux questions sur les procédures internes, générer des premiers jets de rapports, et rechercher des précédents dans une base de cas clients. Quelle est la meilleure approche ?",
    options: [
      {
        label: "A",
        text: "Proposer un seul assistant polyvalent qui couvre les trois cas d'usage simultanément",
      },
      {
        label: "B",
        text: "Expliquer que \"ChatGPT\" n'est pas un produit déployable chez un client, et reformuler la demande autour des trois couches du stack IA pour chaque cas d'usage",
      },
      {
        label: "C",
        text: "Sélectionner le cas d'usage le plus simple des trois, livrer rapidement, et ajouter les autres en phases suivantes",
      },
      {
        label: "D",
        text: "Demander au client de choisir un seul cas d'usage car les trois ne peuvent pas coexister dans une même architecture",
      },
    ],
    correctAnswer: "B",
    explanation:
      "L'AI Engineer a deux responsabilités : recadrer la référence imprécise à \"ChatGPT\" et structurer les trois besoins réels selon le framework des trois couches. Cette structuration permet ensuite une priorisation éclairée. A est une erreur de conception : trois cas d'usage différents ont souvent des architectures différentes. D est incorrect : les trois cas peuvent coexister avec une architecture modulaire.",
  },

  // MODULE 2 — Q4-6
  {
    id: "final-q4",
    question:
      "Un client demande pourquoi le modèle refuse de rédiger certains types de contenu commercial agressif — pourtant légal — et préfère des formulations plus mesurées. Quelle explication est la plus juste ?",
    options: [
      {
        label: "A",
        text: "Le modèle a été configuré avec un filtre de contenu qui bloque les formulations commerciales agressives selon des règles lexicales prédéfinies",
      },
      {
        label: "B",
        text: "Le processus de RLHF a appris au modèle, via des évaluateurs humains exprimant leurs préférences, à favoriser des formulations plus équilibrées — même si la formulation agressive est légale",
      },
      {
        label: "C",
        text: "Le modèle a été entraîné uniquement sur des textes académiques et ne maîtrise pas les codes du marketing commercial",
      },
      {
        label: "D",
        text: "La température du modèle est configurée trop bas, ce qui empêche la génération de formulations créatives et percutantes",
      },
    ],
    correctAnswer: "B",
    explanation:
      "Le RLHF est précisément le mécanisme par lequel les préférences humaines sont encodées dans le comportement du modèle. Des évaluateurs humains ont, lors de l'entraînement, systématiquement préféré les réponses mesurées aux formulations agressives. Ce n'est pas un filtre lexical (A), facilement contournable. La température (D) n'a aucun lien avec les préférences éthiques du modèle.",
  },
  {
    id: "final-q5",
    question:
      "Le fait que les LLMs fonctionnent par prédiction séquentielle de tokens a une conséquence pratique directe sur la façon dont un AI Engineer doit concevoir un système pour des tâches arithmétiques complexes. Laquelle ?",
    options: [
      {
        label: "A",
        text: "Les LLMs sont excellents en arithmétique car les chiffres sont des tokens comme les mots",
      },
      {
        label: "B",
        text: "Il faut utiliser une température très basse pour forcer le modèle à calculer de façon déterministe",
      },
      {
        label: "C",
        text: "Il ne faut pas faire confiance au LLM pour exécuter des calculs complexes — l'architecture doit lui fournir un outil de calcul externe (code interpreter, calculatrice) plutôt que de lui demander de calculer lui-même",
      },
      {
        label: "D",
        text: "Le finetuning sur des datasets mathématiques suffit à rendre le LLM fiable pour tous types de calculs arithmétiques",
      },
    ],
    correctAnswer: "C",
    explanation:
      "Puisqu'un LLM prédit des tokens plausibles plutôt que de calculer, les erreurs arithmétiques sont structurellement inévitables. La réponse correcte est architecturale : donner au modèle accès à un outil de calcul (code interpreter Python, calculatrice) dont le résultat est exact par définition. B est faux : la température affecte la variabilité, pas la précision des calculs.",
  },
  {
    id: "final-q6",
    question:
      'Un client veut que son assistant IA génère des fiches produit dans un format très précis : titre (max 60 caractères), description (exactement 3 phrases), liste de 5 caractéristiques clés, et prix formaté en "XX,XX €". Quelle approche garantit le mieux la conformité au format en production ?',
    options: [
      {
        label: "A",
        text: 'Demander dans le user prompt : "Génère une fiche produit avec un titre court, une description de 3 phrases, 5 caractéristiques et le prix en euros"',
      },
      {
        label: "B",
        text: "Utiliser les mécanismes d'output structuré natifs du provider (response_format avec schéma JSON défini) combinés à un output guardrail validant la longueur du titre et le nombre de phrases",
      },
      {
        label: "C",
        text: "Fournir 10 exemples de fiches correctement formatées en few-shot pour que le modèle reproduise le format",
      },
      {
        label: "D",
        text: "Configurer une température de 0.0 pour forcer le modèle à suivre scrupuleusement le format demandé",
      },
    ],
    correctAnswer: "B",
    explanation:
      "La conformité à un format précis en production nécessite des contraintes programmatiques. Les mécanismes d'output structuré natifs (function calling, response_format) garantissent la structure JSON. L'output guardrail valide les contraintes spécifiques que le schéma JSON seul ne peut pas vérifier. A est une instruction en langage naturel — respectée \"la plupart du temps\", insuffisant en production. D est une confusion : la température 0.0 rend les réponses déterministes, elle ne force pas la conformité à un format.",
  },

  // MODULE 3 — Q7-9
  {
    id: "final-q7",
    question:
      "Une ESN construit un pipeline d'évaluation pour choisir entre deux modèles pour un assistant de rédaction de rapports d'audit en français. Elle décide d'utiliser GPT-4o comme juge (LLM-as-judge). Le responsable qualité soulève une objection. Laquelle est la plus légitime ?",
    options: [
      {
        label: "A",
        text: "GPT-4o n'est pas capable d'évaluer des textes en français avec la même fiabilité qu'en anglais",
      },
      {
        label: "B",
        text: "Utiliser GPT-4o comme juge favorisera systématiquement les réponses qui ressemblent au style GPT-4o (self-enhancement bias) si l'un des deux modèles candidats est également de la famille OpenAI",
      },
      {
        label: "C",
        text: "Le LLM-as-judge est une technique expérimentale non validée en production — il faut uniquement des évaluateurs humains",
      },
      {
        label: "D",
        text: "GPT-4o a un biais de position qui le rend incapable d'évaluer des textes de plus de 500 tokens",
      },
    ],
    correctAnswer: "B",
    explanation:
      "Le self-enhancement bias est un biais documenté du LLM-as-judge : un modèle évalue plus favorablement les réponses qui ressemblent à ce qu'il produirait lui-même. Si l'un des candidats est de la famille OpenAI, utiliser GPT-4o comme juge introduit un biais systématique. La solution : utiliser un juge d'une famille différente des candidats. A est faux : GPT-4o est très compétent en français. C est faux : le LLM-as-judge est une pratique établie et efficace.",
  },
  {
    id: "final-q8",
    question:
      "Un client du secteur industriel hésite entre deux options pour son assistant de maintenance : (A) GPT-4o via API Azure (coût estimé : 1 200 €/mois, latence 1,8s) ou (B) Llama 3 70B en self-hosted sur GPU cloud (coût infra estimé : 2 800 €/mois, latence 0,9s). La contrainte principale est la souveraineté des données (hébergement en France). Quelle analyse est correcte ?",
    options: [
      {
        label: "A",
        text: "L'option B est préférable car la latence deux fois plus faible améliore significativement l'expérience des techniciens",
      },
      {
        label: "B",
        text: "L'option A est préférable car le coût mensuel est inférieur et la latence de 1,8s est acceptable pour un assistant de maintenance non temps-réel",
      },
      {
        label: "C",
        text: "L'option B est préférable car le self-hosted garantit une souveraineté totale des données, indépendamment du surcoût",
      },
      {
        label: "D",
        text: "Il manque un critère décisif pour trancher : les performances comparées des deux modèles sur des cas réels de maintenance industrielle en français",
      },
    ],
    correctAnswer: "D",
    explanation:
      "Tous les critères opérationnels sont connus — mais la qualité comparative des deux modèles sur le use case spécifique n'a pas été évaluée. Azure héberge en France et respecte le RGPD — la contrainte de souveraineté ne tranche donc pas automatiquement en faveur du self-hosted. A et B sont des recommandations prématurées sans évaluation empirique sur le domaine.",
  },
  {
    id: "final-q9",
    question:
      "Un AI Engineer compare trois modèles sur 60 cas de classification de contrats : Modèle A (88 % de précision, latence 2,1s, 0,04 €/1000 tokens), Modèle B (91 % de précision, latence 3,8s, 0,12 €/1000 tokens), Modèle C (86 % de précision, latence 1,2s, 0,01 €/1000 tokens). Le volume prévu est 500 classifications par jour. Priorité absolue : coût maîtrisé, avec une précision minimale acceptable de 87 %. Quel modèle recommander ?",
    options: [
      { label: "A", text: "Modèle A — meilleur équilibre précision/coût/latence" },
      {
        label: "B",
        text: "Modèle B — la précision la plus élevée justifie le surcoût en contexte juridique",
      },
      {
        label: "C",
        text: "Modèle C — le moins cher, mais la précision de 86 % est en dessous du seuil minimal acceptable de 87 %",
      },
      {
        label: "D",
        text: "Modèle A — seul modèle qui respecte simultanément la contrainte de précision (88 % > 87 %) et qui est le moins cher des deux modèles conformes",
      },
    ],
    correctAnswer: "D",
    explanation:
      "La contrainte est explicite : précision ≥ 87 % ET coût maîtrisé comme priorité absolue. Le Modèle C (86 %) est éliminé car il ne respecte pas la contrainte de précision minimale. Entre Modèle A (88 %, 0,04 €/1000 tokens) et Modèle B (91 %, 0,12 €/1000 tokens), le Modèle A respecte la contrainte de précision à trois fois le coût inférieur.",
  },

  // MODULE 4 — Q10-12
  {
    id: "final-q10",
    question:
      "Un consultant ESN travaille depuis six semaines sur le prompt système d'un assistant de veille réglementaire. Il a produit huit versions. La version 3 fonctionnait très bien sur le droit du travail. La version 8 (actuelle) performe mieux sur le droit fiscal mais a régressé sur le droit du travail. Personne ne sait exactement ce qui a changé. Quel est le problème structurel sous-jacent ?",
    options: [
      {
        label: "A",
        text: "Le modèle a subi une mise à jour du provider qui a modifié son comportement entre les versions 3 et 8",
      },
      {
        label: "B",
        text: "Le prompt a été modifié sans versioning ni pipeline d'évaluation — les régressions ne sont pas détectables avant d'affecter les utilisateurs",
      },
      {
        label: "C",
        text: "Le few-shot de la version 3 était plus adapté au droit du travail et a été supprimé dans les versions suivantes",
      },
      {
        label: "D",
        text: "La fenêtre de contexte a été dépassée entre les versions 3 et 8, causant des pertes d'information",
      },
    ],
    correctAnswer: "B",
    explanation:
      "Le problème décrit est le symptôme classique d'un prompt géré sans discipline d'ingénierie : absence de versioning, absence de pipeline d'évaluation, absence de changelog. Avec un versioning approprié et un eval couvrant les deux domaines, la régression sur le droit du travail aurait été détectée avant le déploiement de la version 8.",
  },
  {
    id: "final-q11",
    question:
      "Un AI Engineer doit concevoir un prompt pour générer automatiquement des synthèses de réunions de direction à partir de transcriptions brutes. Les réunions abordent des sujets sensibles (décisions RH, résultats financiers non publiés). Le directeur général demande si la transcription peut être mise directement dans le system prompt. Quelle est la réponse correcte ?",
    options: [
      {
        label: "A",
        text: "Oui — le system prompt est le meilleur endroit pour des informations sensibles car il est chiffré côté serveur",
      },
      {
        label: "B",
        text: "Non — les transcriptions doivent être injectées dans le user prompt à chaque requête : pour des raisons techniques (longueur variable des transcriptions) et de sécurité (le system prompt peut être révélé par prompt injection)",
      },
      {
        label: "C",
        text: "Oui — placer la transcription dans le system prompt améliore la qualité de la synthèse car le modèle y accorde plus d'attention",
      },
      {
        label: "D",
        text: "Non — les transcriptions de réunions ne peuvent pas être traitées par un LLM pour des raisons de confidentialité inhérentes à la technologie",
      },
    ],
    correctAnswer: "B",
    explanation:
      "Deux arguments s'opposent à mettre la transcription dans le system prompt. D'abord, l'argument technique : le system prompt est fixe par définition — des transcriptions variables appartiennent naturellement au user prompt. Ensuite, l'argument de sécurité : le system prompt peut être partiellement révélé par des techniques de prompt injection — des données ultra-sensibles ne doivent jamais y figurer. A est faux sur le chiffrement.",
  },
  {
    id: "final-q12",
    question:
      "Un AI Engineer teste deux versions d'un prompt pour analyser des verbatims. Version 1 (zero-shot) obtient 71 % de cohérence avec les annotations humaines, Version 2 (few-shot, 4 exemples) obtient 84 %. Le responsable métier suggère d'ajouter 20 exemples supplémentaires pour atteindre 95 %. Quelle réponse l'AI Engineer doit-il donner ?",
    options: [
      {
        label: "A",
        text: "Approuver — plus d'exemples en few-shot améliorent toujours les performances de façon proportionnelle",
      },
      {
        label: "B",
        text: "Refuser — le few-shot est limité à 5 exemples maximum par contrainte technique des modèles actuels",
      },
      {
        label: "C",
        text: "Nuancer — au-delà de 5 à 7 exemples, le gain marginal décroît rapidement, les exemples supplémentaires consomment du contexte précieux, et 20 exemples de mauvaise qualité peuvent dégrader les performances ; l'action suivante est d'analyser les 29 % d'erreurs pour identifier si elles relèvent du prompt ou d'une ambiguïté structurelle des verbatims",
      },
      {
        label: "D",
        text: "Approuver conditionnellement — en ajoutant 20 exemples mais en réduisant leur longueur pour compenser la consommation de contexte",
      },
    ],
    correctAnswer: "C",
    explanation:
      "Le rendement marginal du few-shot décroît rapidement après 5 à 7 exemples bien choisis. Ajouter 20 exemples peut même dégrader les performances si certains sont ambigus ou contradictoires. La vraie question est : pourquoi 29 % d'erreurs ? L'analyse des cas d'échec est l'étape suivante. A est faux sur la proportionnalité. B est faux : il n'existe pas de limite technique fixe à 5 exemples.",
  },

  // MODULE 5 — Q13-15
  {
    id: "final-q13",
    question:
      "Une équipe ESN indexe 500 contrats de travail (format PDF, entre 8 et 25 pages chacun) dans une base vectorielle pour un assistant RH. L'ingénieur propose de découper chaque contrat en chunks de 100 tokens pour maximiser la granularité du retrieval. Le tech lead s'y oppose. Quelle est la justification correcte du tech lead ?",
    options: [
      {
        label: "A",
        text: "100 tokens est une taille de chunk trop grande — il faut aller à 50 tokens pour que les embeddings soient plus précis",
      },
      {
        label: "B",
        text: "Des chunks de 100 tokens sont trop petits : ils perdent le contexte nécessaire à la compréhension des clauses contractuelles, et l'embedding d'un fragment isolé ne capture pas le sens de la clause complète dont il est extrait",
      },
      {
        label: "C",
        text: "Il faut éviter de découper les contrats et indexer chaque contrat complet comme un seul chunk, pour préserver l'intégrité du document",
      },
      {
        label: "D",
        text: "La taille de 100 tokens est correcte pour les PDF, mais il faudrait utiliser 200 tokens pour les contrats de plus de 15 pages",
      },
    ],
    correctAnswer: "B",
    explanation:
      "Le chunking trop fin est un piège classique. Un chunk de 100 tokens représente environ 75 mots — souvent insuffisant pour encapsuler une clause contractuelle complète. L'embedding de ce fragment produit un vecteur qui ne représente pas le sens complet de la clause. La taille de chunk optimale pour des contrats juridiques se situe généralement entre 300 et 600 tokens, avec un chevauchement (overlap) de 50 à 100 tokens. C est l'inverse — un contrat de 25 pages comme chunk unique dilue complètement le signal sémantique.",
  },
  {
    id: "final-q14",
    question:
      "Un agent IA est déployé pour automatiser la veille concurrentielle d'un client. Il doit chaque matin chercher les actualités sur 5 concurrents définis. Lors d'un test, on observe que l'agent boucle indéfiniment sur l'étape de recherche d'un concurrent dont le nom est ambigu (plusieurs entreprises portent le même nom). Quel mécanisme aurait dû être prévu pour éviter ce failure mode ?",
    options: [
      {
        label: "A",
        text: "Augmenter la température du modèle pour que l'agent explore davantage de solutions à l'ambiguïté",
      },
      {
        label: "B",
        text: "Fournir à l'agent une mémoire externe contenant les URLs et identifiants précis de chaque concurrent, éliminant l'ambiguïté à la source — et implémenter un mécanisme de timeout avec escalade humaine si une étape dépasse un nombre défini d'itérations",
      },
      {
        label: "C",
        text: "Configurer l'agent pour qu'il ignore les concurrents dont la recherche échoue et continue avec les autres",
      },
      {
        label: "D",
        text: "Remplacer l'agent autonome par un workflow entièrement manuel pour les cas ambigus",
      },
    ],
    correctAnswer: "B",
    explanation:
      "La réponse correcte combine deux mécanismes complémentaires. Premier mécanisme préventif : une mémoire externe structurée avec les identifiants précis élimine l'ambiguïté avant qu'elle ne devienne un problème. Deuxième mécanisme correctif : un timeout avec escalade humaine est indispensable pour tout agent en production. A empire le problème : une température élevée introduit plus de variabilité sans résoudre l'ambiguïté structurelle. C est une dégradation silencieuse.",
  },
  {
    id: "final-q15",
    question:
      'Un client pose la question : "On a un LLM excellent — est-ce qu\'on a vraiment besoin du RAG ? Pourquoi ne pas juste mettre tous nos documents dans le contexte du modèle ?" Le modèle utilisé a une fenêtre de contexte de 128 000 tokens. La base documentaire du client fait 2 millions de tokens. Quelle réponse est la plus complète et la plus honnête ?',
    options: [
      {
        label: "A",
        text: '"Oui, avec 128 000 tokens de contexte, vous pouvez mettre suffisamment de documents pour couvrir la plupart des questions."',
      },
      {
        label: "B",
        text: "\"Non — 2 millions de tokens dépassent la fenêtre de contexte. Mais même si ce n'était pas le cas, injecter tout le corpus dans chaque requête est prohibitivement coûteux, dégrade la qualité de l'attention sur les passages pertinents, et augmente massivement la latence. Le RAG sélectionne précisément ce qui est pertinent pour chaque question.\"",
      },
      {
        label: "C",
        text: "\"Oui — les modèles avec une grande fenêtre de contexte rendent le RAG obsolète. C'est la direction que prend l'industrie.\"",
      },
      {
        label: "D",
        text: "\"Non — la technique 'tout mettre dans le contexte' est interdite par la plupart des providers pour des raisons de sécurité.\"",
      },
    ],
    correctAnswer: "B",
    explanation:
      'La réponse B est techniquement complète sur tous les aspects : la contrainte de volume (2M tokens > 128K tokens de fenêtre), le coût (chaque requête paierait pour 128 000 tokens de contexte), la dégradation de l\'attention ("lost in the middle"), et la latence. A est faux sur les chiffres. C est une affirmation tendancielle simpliste. D est faux.',
  },

  // MODULE 6 — Q16-18
  {
    id: "final-q16",
    question:
      "Un système IA en production pour un client du secteur de l'énergie traite des demandes d'intervention urgente. Depuis trois semaines, le taux de feedback négatif est stable à 8 % — en dessous du seuil d'alerte de 15 %. Pourtant, l'usage du système a chuté de 340 requêtes/jour à 180 requêtes/jour sur la même période. Quelle interprétation est la plus pertinente ?",
    options: [
      {
        label: "A",
        text: "La baisse d'usage est normale : les techniciens ont appris à utiliser le système et posent des questions plus ciblées, donc moins nombreuses",
      },
      {
        label: "B",
        text: "Le taux de feedback négatif à 8 % confirme que le système est satisfaisant — la baisse d'usage a une cause externe",
      },
      {
        label: "C",
        text: "La baisse de 47 % des requêtes en trois semaines est un signal fort d'abandon silencieux — les techniciens ont cessé d'utiliser le système sans le signaler, ce qui est un indicateur de satisfaction réelle bien plus fiable que le taux de feedback négatif",
      },
      {
        label: "D",
        text: "Il faut attendre d'atteindre le seuil d'alerte de 15 % de feedback négatif avant d'intervenir",
      },
    ],
    correctAnswer: "C",
    explanation:
      "Une baisse de 47 % du volume de requêtes en trois semaines est un signal d'alarme massif qui contredit le taux de feedback négatif apparent. Les techniciens qui abandonnent le système ne cliquent pas sur ✗ — ils ne l'utilisent plus du tout. Le feedback négatif ne mesure que l'insatisfaction des utilisateurs qui persistent ; il est muet sur ceux qui ont abandonné.",
  },
  {
    id: "final-q17",
    question:
      "Une ESN déploie un assistant IA pour une chaîne hôtelière. Le SLA contractuel impose des réponses en moins de 1,5 seconde. Les tests de charge montrent une latence moyenne de 2,8 secondes. L'AI Engineer identifie que 60 % des requêtes de test sont des questions similaires sur les horaires de check-in/check-out et le petit déjeuner. Quelle combinaison d'actions a le plus de chance de ramener la latence sous 1,5 seconde ?",
    options: [
      {
        label: "A",
        text: "Migrer vers un modèle plus rapide et augmenter les ressources serveur",
      },
      {
        label: "B",
        text: "Activer le streaming pour que la réponse commence à s'afficher immédiatement, et réduire la taille du system prompt",
      },
      {
        label: "C",
        text: "Implémenter un cache sémantique sur les questions fréquentes (répondant aux 60 % de requêtes similaires en < 100 ms) et contraindre la longueur des réponses générées à 150 tokens maximum",
      },
      {
        label: "D",
        text: "Déployer un model router qui dirige toutes les requêtes vers un modèle léger, en sacrifiant la qualité des réponses complexes",
      },
    ],
    correctAnswer: "C",
    explanation:
      "60 % des requêtes sont similaires et concernent des questions récurrentes à réponses stables. Un cache sémantique sert ces requêtes en moins de 100 ms — sans appel au modèle. La latence globale moyenne s'effondre mécaniquement. En parallèle, contraindre la longueur de sortie réduit la phase de génération qui domine la latence réelle. A est coûteux et peu ciblé — sans cache, les 60 % de requêtes récurrentes continuent de solliciter le modèle. B améliore la latence perçue, pas la latence réelle mesurée par le SLA.",
  },
  {
    id: "final-q18",
    question:
      "Un AI Engineer fait le bilan d'un projet livré il y a six mois pour un client du secteur de la formation professionnelle. À l'analyse des traces et du feedback, il constate : (1) 34 % des sessions se terminent sans que l'utilisateur ait cliqué sur une formation proposée, (2) les reformulations de question représentent 28 % des échanges, (3) le feedback négatif porte à 70 % sur des propositions \"trop généralistes\". Quel plan d'action est le plus pertinent ?",
    options: [
      {
        label: "A",
        text: "Changer de modèle — les propositions généralistes indiquent que le modèle actuel n'est pas assez performant sur le domaine de la formation professionnelle",
      },
      {
        label: "B",
        text: "Enrichir le contexte injecté à chaque requête avec le profil détaillé du demandeur d'emploi (secteur recherché, niveau de qualification, contraintes géographiques, formations déjà effectuées) et ajuster le prompt pour exiger une justification de chaque proposition par rapport au profil spécifique",
      },
      {
        label: "C",
        text: "Augmenter le nombre de formations proposées par réponse (passer de 3 à 8) pour maximiser les chances qu'une corresponde aux attentes",
      },
      {
        label: "D",
        text: "Implémenter un guardrail qui rejette toutes les réponses contenant des formulations génériques détectées par mots-clés",
      },
    ],
    correctAnswer: "B",
    explanation:
      "Le diagnostic est clair : les trois signaux convergent vers le même problème. Les propositions sont trop généralistes parce que le système ne dispose pas du profil détaillé du demandeur pour personnaliser. Les reformulations (28 %) indiquent que les conseillers cherchent à préciser le contexte que le système ne capte pas automatiquement. La solution est un enrichissement du contexte avec les données structurées du profil. A est faux : le modèle n'est pas en cause. C empire le problème.",
  },
]
