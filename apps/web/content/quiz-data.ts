import type { QuizQuestion } from "@formations-ia/shared-types"

export const quizData: Record<string, QuizQuestion[]> = {
  "ai-engineering": [
    {
      id: "m1q1",
      question: "Un AI Engineer travaille principalement sur :",
      options: [
        {
          label: "A",
          text: "L'entraînement de modèles de machine learning à partir de données brutes",
        },
        {
          label: "B",
          text: "L'orchestration de modèles pré-entraînés pour répondre à des besoins métier",
        },
        {
          label: "C",
          text: "Le développement d'interfaces utilisateur connectées à des APIs tierces",
        },
        { label: "D", text: "La conception d'architectures cloud pour héberger des modèles IA" },
      ],
      correctAnswer: "B",
      explanation:
        "L'AI Engineering se distingue du ML Engineering précisément parce qu'il ne part pas de la donnée brute pour créer un modèle — il part du modèle existant pour créer un système. A décrit le ML Engineering. C décrit le Full-Stack avec intégration IA superficielle. D décrit un profil DevOps/Cloud.",
    },
    {
      id: "m1q2",
      question:
        "Un client du secteur pharmaceutique vous demande de construire un système permettant à ses équipes réglementaires de retrouver des informations précises dans 20 ans d'archives de dossiers de mise sur le marché. Quel cas d'usage AI Engineering est le plus adapté ?",
      options: [
        { label: "A", text: "Un chatbot conversationnel grand public" },
        { label: "B", text: "Un modèle de classification de documents pharmaceutiques" },
        { label: "C", text: "Un pipeline de recherche sémantique sur base documentaire (RAG)" },
        { label: "D", text: "Un système de génération automatique de dossiers réglementaires" },
      ],
      correctAnswer: "C",
      explanation:
        "La demande est claire : retrouver de l'information dans un corpus existant. C'est le cas d'usage canonique de la recherche sémantique et du RAG. B résoudrait un problème de tri automatique, pas de recherche d'information. D génère du contenu — c'est l'inverse du besoin.",
    },
    {
      id: "m1q3",
      question: "Laquelle de ces affirmations est FAUSSE ?",
      options: [
        {
          label: "A",
          text: "Un Foundation Model peut accomplir des dizaines de tâches différentes sans entraînement spécifique",
        },
        {
          label: "B",
          text: "L'AI Engineering nécessite une maîtrise approfondie de PyTorch et des algorithmes d'optimisation",
        },
        {
          label: "C",
          text: "Les trois couches du stack IA sont idéalement découplées pour faciliter les changements de modèle",
        },
        { label: "D", text: "Un LLM est une sous-famille des Foundation Models" },
      ],
      correctAnswer: "B",
      explanation:
        "La maîtrise de PyTorch et des algorithmes d'optimisation relève du ML Engineering, pas de l'AI Engineering. Un AI Engineer doit comprendre les modèles, leurs limites, comment les utiliser — pas comment les entraîner mathématiquement.",
    },
    {
      id: "m1q4",
      question:
        "Selon l'intuition développée sur le transfer learning, pourquoi un Foundation Model peut-il répondre à une question sur un domaine métier très spécialisé sans avoir été entraîné spécifiquement dessus ?",
      options: [
        {
          label: "A",
          text: "Parce qu'il a été entraîné sur un dataset spécialisé pour chaque domaine métier",
        },
        {
          label: "B",
          text: "Parce qu'il effectue une recherche en temps réel sur internet pendant l'inférence",
        },
        {
          label: "C",
          text: "Parce que son pré-entraînement massif lui a permis de développer des représentations générales du langage et du raisonnement, transférables à des tâches nouvelles",
        },
        {
          label: "D",
          text: "Parce que la taille du modèle compense le manque de données spécialisées par interpolation statistique brute",
        },
      ],
      correctAnswer: "C",
      explanation:
        "C'est l'essence du transfer learning à grande échelle. A est faux : il n'existe pas un dataset spécialisé par domaine. B est faux pour les modèles standards sans outil de recherche externe. D est une formulation plausible en surface mais conceptuellement incorrecte.",
    },
    {
      id: "m1q5",
      question:
        "Un chef de projet ESN présente trois solutions : (1) entraîner un modèle NLP maison, (2) connecter un LLM via API à la base de connaissance existante, (3) demander à un développeur Full-Stack d'intégrer un widget ChatGPT dans l'intranet. Quelle option correspond le mieux à une démarche d'AI Engineering rigoureuse ?",
      options: [
        {
          label: "A",
          text: "L'option 1, car elle garantit un modèle entièrement maîtrisé et spécialisé",
        },
        {
          label: "B",
          text: "L'option 2, car elle mobilise un Foundation Model en l'orchestrant avec les données métier via une couche applicative dédiée",
        },
        {
          label: "C",
          text: "L'option 3, car elle est la plus rapide à livrer et répond au besoin fonctionnel immédiat",
        },
        {
          label: "D",
          text: "Les options 1 et 2 combinées, car l'AI Engineering nécessite toujours un modèle custom en aval",
        },
      ],
      correctAnswer: "B",
      explanation:
        "L'option 2 est la définition opérationnelle de l'AI Engineering : utiliser un Foundation Model (couche modèle), l'orchestrer avec une base de connaissance (couche orchestration), dans une logique métier structurée (couche application). L'option 1 décrit du ML Engineering. L'option 3 est de l'intégration superficielle.",
    },
  ],
  "foundation-models": [
    {
      id: "m2q1",
      question: 'Pourquoi dit-on qu\'un LLM peut "halluciner" ?',
      options: [
        {
          label: "A",
          text: "Parce qu'il accède parfois à des sources d'information non vérifiées sur internet",
        },
        {
          label: "B",
          text: "Parce qu'il génère des séquences de tokens statistiquement plausibles, sans mécanisme intrinsèque de vérification de la vérité",
        },
        {
          label: "C",
          text: "Parce que la température élevée introduit du bruit aléatoire dans ses réponses",
        },
        {
          label: "D",
          text: "Parce que son entraînement contient des données erronées qui biaisent ses réponses",
        },
      ],
      correctAnswer: "B",
      explanation:
        "L'hallucination est une conséquence directe de la nature prédictive des LLMs. Le modèle optimise pour la vraisemblance, pas pour la vérité. A est faux : un LLM standard sans outil de recherche externe n'accède pas à internet. C est partiellement vrai mais incomplet. D confond biais et hallucination.",
    },
    {
      id: "m2q2",
      question:
        "Un client veut utiliser un assistant IA pour répondre aux questions de ses techniciens sur les procédures de maintenance de ses équipements industriels. Ces procédures sont documentées dans 200 manuels PDF internes. Quelle est la configuration la plus sûre ?",
      options: [
        {
          label: "A",
          text: 'Finetuner le modèle sur les 200 manuels pour qu\'il "mémorise" les procédures',
        },
        {
          label: "B",
          text: "Mettre l'ensemble des manuels dans le prompt système à chaque requête",
        },
        {
          label: "C",
          text: "Mettre en place un pipeline RAG qui indexe les manuels et injecte les passages pertinents dans le contexte à chaque question",
        },
        {
          label: "D",
          text: "Utiliser une température élevée pour maximiser la pertinence des réponses",
        },
      ],
      correctAnswer: "C",
      explanation:
        "Le RAG est la réponse structurelle au besoin d'ancrage dans des connaissances documentaires précises. A est inadapté pour injecter des connaissances. B est techniquement impossible : 200 manuels dépassent largement les limites de contexte. D est une erreur : une température élevée augmenterait les hallucinations.",
    },
    {
      id: "m2q3",
      question: "Laquelle de ces affirmations sur le finetuning est VRAIE ?",
      options: [
        { label: "A", text: "Le finetuning permet d'augmenter la limite de contexte du modèle" },
        {
          label: "B",
          text: "Le finetuning est la méthode la plus rapide et la moins chère pour adapter un LLM à un domaine métier",
        },
        {
          label: "C",
          text: "Le finetuning supervisé s'appuie sur des exemples de conversations de haute qualité pour affiner le comportement du modèle",
        },
        {
          label: "D",
          text: "Un modèle finetuné n'a plus besoin de mécanisme de guardrails car son alignement est garanti",
        },
      ],
      correctAnswer: "C",
      explanation:
        "C est la définition exacte du finetuning supervisé (SFT). A est faux : le finetuning n'augmente pas la fenêtre de contexte. B est faux : le finetuning est plus coûteux et complexe que le RAG ou le prompt engineering. D est faux et dangereux.",
    },
    {
      id: "m2q4",
      question:
        "Pourquoi la gestion de la longueur de contexte est-elle une compétence centrale de l'AI Engineer ?",
      options: [
        {
          label: "A",
          text: "Parce que les modèles refusent de traiter les contextes trop longs pour des raisons de sécurité",
        },
        {
          label: "B",
          text: "Parce que le coût de calcul de l'attention croît quadratiquement avec la longueur du contexte, et qu'un contexte trop long dégrade la qualité de l'attention sur les passages importants",
        },
        {
          label: "C",
          text: "Parce que les providers facturent à la longueur de contexte et que l'optimisation est purement économique",
        },
        {
          label: "D",
          text: "Parce que le mécanisme de sampling devient moins précis lorsque le contexte dépasse une certaine longueur",
        },
      ],
      correctAnswer: "B",
      explanation:
        "La complexité de l'attention est quadratique — doubler le contexte quadruple le coût de calcul. Au-delà du coût, un contexte trop long dilue l'attention sur les passages importants (phénomène \"lost in the middle\"). C est partiellement vrai mais réducteur. A et D sont faux.",
    },
    {
      id: "m2q5",
      question:
        "Un AI Engineer doit configurer un système de génération de rapports financiers automatiques. Il doit choisir une valeur de température. Quelle approche est la plus rigoureuse ?",
      options: [
        {
          label: "A",
          text: "Température 0.9 — pour maximiser la richesse lexicale des rapports générés",
        },
        {
          label: "B",
          text: "Température 0.0 — pour garantir une reproductibilité absolue et éliminer tout risque d'erreur factuelle",
        },
        {
          label: "C",
          text: "Température 0.1 à 0.2 — pour favoriser la précision et la cohérence tout en conservant une légère variabilité dans la formulation",
        },
        {
          label: "D",
          text: "Température 0.5 — valeur de compromis universellement recommandée pour les cas métier",
        },
      ],
      correctAnswer: "C",
      explanation:
        'Pour des rapports financiers, la précision prime sur la créativité. A est inadapté : une température élevée augmente les erreurs sur des données financières. B est rigide : une température 0.0 peut produire des réponses sous-optimales répétées. D est une affirmation fausse — il n\'existe pas de valeur "universelle".',
    },
  ],
  "model-selection": [
    {
      id: "m3q1",
      question: "Dans quel ordre logique se déroule un workflow de sélection de modèle rigoureux ?",
      options: [
        {
          label: "A",
          text: "Évaluation empirique → Présélection → Cadrage des contraintes → Décision documentée",
        },
        {
          label: "B",
          text: "Cadrage des contraintes → Présélection → Évaluation empirique → Décision documentée",
        },
        {
          label: "C",
          text: "Présélection → Cadrage des contraintes → Décision documentée → Évaluation empirique",
        },
        {
          label: "D",
          text: "Décision documentée → Cadrage des contraintes → Présélection → Évaluation empirique",
        },
      ],
      correctAnswer: "B",
      explanation:
        "Le cadrage des contraintes doit précéder toute autre étape — les contraintes non négociables éliminent d'emblée certains modèles. Évaluer empiriquement des modèles qui auraient été exclus dès le cadrage est une perte de temps.",
    },
    {
      id: "m3q2",
      question:
        "Un client de l'industrie pharmaceutique vous demande un système d'aide à la rédaction de dossiers réglementaires en anglais. Contrainte : données confidentielles, pas d'hébergement hors UE. Quel critère doit primer ?",
      options: [
        { label: "A", text: "La latence — les rédacteurs ont besoin de réponses instantanées" },
        { label: "B", text: "Le coût à l'usage — 20 dossiers par mois représente un volume élevé" },
        {
          label: "C",
          text: "La souveraineté des données et la qualité de génération en anglais technique",
        },
        {
          label: "D",
          text: "Le score sur HumanEval — garant de la qualité sur des textes complexes",
        },
      ],
      correctAnswer: "C",
      explanation:
        "La contrainte de souveraineté est non négociable et élimine les providers hors UE. Sur ce périmètre restreint, la qualité de génération en anglais technique est le critère déterminant. D est trompeur : HumanEval mesure la qualité sur du code Python, pas sur la rédaction réglementaire.",
    },
    {
      id: "m3q3",
      question: "Laquelle de ces affirmations sur les benchmarks publics est VRAIE ?",
      options: [
        {
          label: "A",
          text: "LMSYS Chatbot Arena est le benchmark le plus fiable car il s'appuie sur des évaluations humaines réelles",
        },
        {
          label: "B",
          text: "Un modèle avec un score MMLU élevé sera nécessairement performant sur des use cases métier en français",
        },
        {
          label: "C",
          text: "La contamination des données de test dans les corpus d'entraînement peut gonfler artificiellement les scores de benchmark",
        },
        {
          label: "D",
          text: "Les benchmarks publics sont mis à jour en temps réel pour éviter que les providers les optimisent",
        },
      ],
      correctAnswer: "C",
      explanation:
        "La contamination des données est un problème documenté et reconnu par la communauté de recherche. A est partiellement vrai mais exagéré. B est faux : MMLU mesure du raisonnement académique multidisciplinaire en anglais. D est faux.",
    },
    {
      id: "m3q4",
      question:
        "Pourquoi la métrique BLEU est-elle inadaptée pour évaluer les réponses d'un LLM génératif ?",
      options: [
        { label: "A", text: "Parce qu'elle est trop complexe à calculer pour des textes longs" },
        {
          label: "B",
          text: "Parce qu'elle mesure le chevauchement de mots entre réponse générée et réponse de référence, sans capturer l'équivalence sémantique",
        },
        {
          label: "C",
          text: "Parce qu'elle favorise les réponses courtes et pénalise les réponses détaillées",
        },
        {
          label: "D",
          text: "Parce qu'elle a été conçue pour le code et non pour le texte en langage naturel",
        },
      ],
      correctAnswer: "B",
      explanation:
        'Deux réponses sémantiquement identiques ("expire le 30 juin" vs "prend fin le 30 juin") obtiennent des scores BLEU très différents, parce que la métrique compare des séquences de mots littéraux — pas du sens. BLEU a été conçu pour la traduction automatique de textes, pas pour le code.',
    },
    {
      id: "m3q5",
      question:
        "Un AI Engineer compare deux modèles pour un use case de synthèse de comptes-rendus de réunion en français. Il utilise uniquement le classement LMSYS Chatbot Arena pour faire son choix. Quelle est la principale limite ?",
      options: [
        { label: "A", text: "LMSYS Chatbot Arena ne couvre pas les modèles européens" },
        {
          label: "B",
          text: "Le classement LMSYS reflète des préférences sur des tâches généralistes et un public majoritairement anglophone, sans corrélation garantie avec la synthèse de réunions en français",
        },
        { label: "C", text: "LMSYS Chatbot Arena ne prend pas en compte la latence" },
        {
          label: "D",
          text: "Les évaluations humaines de LMSYS sont moins fiables que les métriques automatiques comme BLEU",
        },
      ],
      correctAnswer: "B",
      explanation:
        "LMSYS est précieux pour une comparaison générale — mais ses évaluations portent sur des interactions conversationnelles variées, avec une surreprésentation d'utilisateurs anglophones. La synthèse de comptes-rendus en français est une tâche spécifique que le classement Arena ne capturera pas.",
    },
  ],
  "prompt-engineering": [
    {
      id: "m4q1",
      question: "Quelle est la différence fondamentale entre le system prompt et le user prompt ?",
      options: [
        {
          label: "A",
          text: "Le system prompt est généré par le modèle, le user prompt est écrit par l'utilisateur",
        },
        {
          label: "B",
          text: "Le system prompt définit le comportement permanent du modèle et est invisible pour l'utilisateur, le user prompt est le message variable envoyé à chaque échange",
        },
        {
          label: "C",
          text: "Le system prompt est chiffré et totalement confidentiel, le user prompt est accessible à tous",
        },
        {
          label: "D",
          text: "Le system prompt utilise un langage de programmation spécifique, le user prompt utilise le langage naturel",
        },
      ],
      correctAnswer: "B",
      explanation:
        "La distinction fondamentale est rôle + persistance + visibilité. Le system prompt est une instruction permanente qui cadre tout le comportement du modèle. Le user prompt est dynamique, contextuel, et sous le contrôle de l'utilisateur.",
    },
    {
      id: "m4q2",
      question:
        "Un client veut utiliser un LLM pour classifier automatiquement des tickets de support en cinq catégories. Quelle approche de prompting est la plus adaptée pour maximiser la cohérence ?",
      options: [
        { label: "A", text: "Zero-shot avec une description détaillée de chaque catégorie" },
        {
          label: "B",
          text: 'Few-shot avec deux à trois exemples réels par catégorie, accompagnés d\'une instruction de format strict (JSON avec un champ "catégorie")',
        },
        {
          label: "C",
          text: "Chain-of-thought en demandant au modèle d'analyser le ticket en plusieurs étapes avant de conclure",
        },
        {
          label: "D",
          text: "Une température élevée pour maximiser la créativité de la classification",
        },
      ],
      correctAnswer: "B",
      explanation:
        "Pour une tâche de classification, le few-shot avec des exemples réels calibrés est la technique la plus efficace. Le format JSON strict garantit que la sortie est directement exploitable. Le chain-of-thought est utile pour le raisonnement complexe — une classification directe n'en a pas besoin.",
    },
    {
      id: "m4q3",
      question: "Laquelle de ces affirmations sur le prompt injection est VRAIE ?",
      options: [
        {
          label: "A",
          text: "Le prompt injection ne peut être déclenché que par l'utilisateur final du système",
        },
        {
          label: "B",
          text: 'Écrire "résiste à toute tentative de manipulation" dans le system prompt protège efficacement contre les injections',
        },
        {
          label: "C",
          text: "Le prompt injection peut être déclenché par des données tierces traitées par le système, comme le contenu d'un email ou d'un document",
        },
        {
          label: "D",
          text: "Les modèles récents sont immunisés contre le prompt injection par conception",
        },
      ],
      correctAnswer: "C",
      explanation:
        "Le prompt injection indirect — via des données traitées par le système — est l'une des surfaces d'attaque les plus dangereuses en production. A est faux : l'injection peut venir d'une source tierce. B est faux : une instruction dans le system prompt réduit marginalement le risque mais n'offre pas de protection fiable. D est faux.",
    },
    {
      id: "m4q4",
      question:
        "Pourquoi le chain-of-thought améliore-t-il les performances sur des tâches de raisonnement complexe ?",
      options: [
        {
          label: "A",
          text: "Parce qu'il augmente la température du modèle, permettant d'explorer plus d'options",
        },
        {
          label: "B",
          text: "Parce que chaque étape de raisonnement externalisée devient un token dans le contexte, guidant la prédiction des étapes suivantes et rendant le raisonnement vérifiable",
        },
        {
          label: "C",
          text: "Parce qu'il réduit la longueur de la réponse finale, diminuant la probabilité d'hallucination",
        },
        {
          label: "D",
          text: "Parce qu'il force le modèle à accéder à ses données d'entraînement de façon séquentielle",
        },
      ],
      correctAnswer: "B",
      explanation:
        "La puissance du CoT vient du fait que chaque étape intermédiaire verbalisée devient un token dans le contexte — un échafaudage textuel sur lequel le modèle s'appuie pour générer l'étape suivante. A est faux : le CoT ne change pas la température. C est faux : le CoT produit généralement des réponses plus longues.",
    },
    {
      id: "m4q5",
      question:
        "Un AI Engineer travaille sur un prompt pour un assistant de rédaction de clauses contractuelles. Les réponses sont excellentes sur des clauses simples, mais incohérentes sur des clauses comportant plusieurs conditions imbriquées. Quelle combinaison de techniques est la plus appropriée ?",
      options: [
        {
          label: "A",
          text: "Augmenter la température pour permettre au modèle d'explorer plus de formulations",
        },
        {
          label: "B",
          text: "Passer en few-shot en ajoutant des exemples de clauses simples supplémentaires",
        },
        {
          label: "C",
          text: "Activer le chain-of-thought pour les clauses complexes, et mettre en place un pipeline de self-consistency pour valider les clauses à enjeu élevé",
        },
        {
          label: "D",
          text: "Réduire la longueur du system prompt pour libérer de la fenêtre de contexte",
        },
      ],
      correctAnswer: "C",
      explanation:
        "Le problème est clairement identifié : les clauses avec conditions imbriquées nécessitent un raisonnement multi-étapes — c'est précisément le cas d'usage du chain-of-thought. Sur des clauses à fort enjeu contractuel, la self-consistency améliore la fiabilité sans changer de modèle.",
    },
  ],
  "rag-agents": [
    {
      id: "m5q1",
      question:
        "Dans une architecture RAG, quelle est la phase la plus déterminante pour la qualité des réponses finales ?",
      options: [
        { label: "A", text: "La génération — le LLM qui formule la réponse finale" },
        {
          label: "B",
          text: "L'indexation — la façon dont les documents sont découpés et transformés en embeddings",
        },
        {
          label: "C",
          text: "Le retrieval — la capacité à récupérer les passages réellement pertinents pour chaque question",
        },
        {
          label: "D",
          text: "Le prompt système — les instructions données au LLM pour générer la réponse",
        },
      ],
      correctAnswer: "C",
      explanation:
        "Si les passages récupérés ne sont pas pertinents, le LLM — aussi excellent soit-il — ne peut pas produire une bonne réponse. La règle fondamentale du RAG : \"garbage in, garbage out\" s'applique au retrieval avant de s'appliquer à la génération.",
    },
    {
      id: "m5q2",
      question:
        "Un client du secteur juridique veut un assistant RAG pour interroger sa base de jurisprudence. Les questions des avocats contiennent souvent des références précises (numéros de décision, dates exactes) mélangées à des questions sémantiques. Quelle stratégie de retrieval est la plus adaptée ?",
      options: [
        { label: "A", text: "Retrieval dense uniquement — il capture la similarité sémantique" },
        {
          label: "B",
          text: "Retrieval sparse (BM25) uniquement — il garantit la précision sur les références exactes",
        },
        {
          label: "C",
          text: "Retrieval hybride — combinant similarité sémantique pour les questions conceptuelles et correspondance lexicale pour les références précises",
        },
        {
          label: "D",
          text: "Retrieval dense avec une température élevée pour élargir le spectre des résultats",
        },
      ],
      correctAnswer: "C",
      explanation:
        "Le cas d'usage combine deux types de requêtes fondamentalement différents : des recherches sémantiques et des recherches exactes. Le retrieval hybride est la réponse structurelle à cette dualité. D est une erreur : la température s'applique au LLM générateur, pas au retrieval.",
    },
    {
      id: "m5q3",
      question: "Laquelle de ces affirmations sur les agents IA est VRAIE ?",
      options: [
        {
          label: "A",
          text: "Un agent IA est autonome par définition et ne nécessite pas de supervision humaine une fois déployé",
        },
        {
          label: "B",
          text: "La boucle infinie est un failure mode impossible dans un agent bien conçu car le LLM reconnaît toujours quand il boucle",
        },
        {
          label: "C",
          text: "Un agent IA combine un LLM avec des outils externes et une capacité de planification pour accomplir des objectifs complexes",
        },
        {
          label: "D",
          text: "Les agents IA sont uniquement adaptés aux tâches longues et complexes",
        },
      ],
      correctAnswer: "C",
      explanation:
        "C est la définition exacte d'un agent : LLM + outils + planification. A est faux et dangereux. B est faux : la boucle infinie est un failure mode documenté et réel.",
    },
    {
      id: "m5q4",
      question:
        "Pourquoi est-il incorrect d'utiliser des modèles d'embedding différents pour l'indexation et le retrieval dans un système RAG ?",
      options: [
        {
          label: "A",
          text: "Parce que les modèles d'embedding récents sont plus performants et rendent l'ancien index obsolète",
        },
        {
          label: "B",
          text: "Parce que différents modèles d'embedding produisent des vecteurs dans des espaces dimensionnels différents, rendant la mesure de similarité sans signification",
        },
        {
          label: "C",
          text: "Parce que le coût de calcul double lorsqu'on utilise deux modèles différents",
        },
        {
          label: "D",
          text: "Parce que les providers d'embedding interdisent contractuellement l'utilisation mixte de leurs modèles",
        },
      ],
      correctAnswer: "B",
      explanation:
        "Deux modèles différents apprennent des espaces différents. Comparer un vecteur produit par le modèle A avec un vecteur produit par le modèle B, c'est mesurer une distance entre des coordonnées dans deux systèmes de référence incompatibles. Le résultat est dépourvu de sens.",
    },
    {
      id: "m5q5",
      question:
        "Un AI Engineer conçoit un agent pour automatiser le traitement des notes de frais. L'agent doit lire les justificatifs, vérifier la conformité, et valider ou rejeter la demande dans le système RH. Quel est le failure mode le plus critique à anticiper en priorité ?",
      options: [
        {
          label: "A",
          text: "L'hallucination d'outil — l'agent pourrait appeler un outil qui n'existe pas",
        },
        {
          label: "B",
          text: "La boucle infinie — l'agent pourrait répéter la vérification de conformité sans fin",
        },
        {
          label: "C",
          text: "L'action irréversible non contrôlée — l'agent pourrait valider ou rejeter des demandes sans supervision humaine sur des cas ambigus ou à fort montant",
        },
        {
          label: "D",
          text: "La dérive de l'objectif — l'agent pourrait traiter des emails hors périmètre notes de frais",
        },
      ],
      correctAnswer: "C",
      explanation:
        "La validation ou le rejet d'une note de frais est une action avec des conséquences financières et humaines directes. Ces actions sont partiellement irréversibles — un remboursement déjà effectué est difficile à récupérer. C est le risque à fort impact qui justifie un Human-in-the-loop sur les cas ambigus et au-delà d'un seuil de montant.",
    },
  ],
  "production-architecture": [
    {
      id: "m6q1",
      question:
        "Quelle est la différence fondamentale entre un input guardrail et un output guardrail ?",
      options: [
        {
          label: "A",
          text: "L'input guardrail est implémenté côté client, l'output guardrail côté serveur",
        },
        {
          label: "B",
          text: "L'input guardrail filtre les requêtes avant qu'elles n'atteignent le modèle, l'output guardrail vérifie les réponses avant qu'elles ne soient présentées à l'utilisateur",
        },
        {
          label: "C",
          text: "L'input guardrail protège contre les attaques externes, l'output guardrail protège contre les bugs du modèle",
        },
        {
          label: "D",
          text: "L'input guardrail est configuré dans le system prompt, l'output guardrail est configuré dans le user prompt",
        },
      ],
      correctAnswer: "B",
      explanation:
        "La distinction est positionnelle dans l'architecture : avant le modèle (input) ou après le modèle (output). L'input guardrail agit comme un filtre d'entrée. L'output guardrail agit comme un contrôle qualité de sortie. Les deux peuvent être côté serveur. Les guardrails sont des composants applicatifs, pas des éléments de prompt.",
    },
    {
      id: "m6q2",
      question:
        "Un client de e-commerce déploie un assistant IA pour le support client. Les analytics montrent que 45 % des questions sont des variations de cinq questions récurrentes. La latence actuelle est de 2,3 secondes. Quelle action aurait le plus d'impact sur la latence et les coûts ?",
      options: [
        { label: "A", text: "Migrer vers un modèle plus rapide pour l'ensemble des requêtes" },
        {
          label: "B",
          text: "Réduire la longueur maximale des réponses autorisées de 500 à 200 tokens",
        },
        {
          label: "C",
          text: "Implémenter un cache sémantique sur les questions fréquentes avec un seuil de similarité élevé",
        },
        { label: "D", text: "Activer le streaming pour masquer la latence perçue" },
      ],
      correctAnswer: "C",
      explanation:
        "Si 45 % des questions sont des variations de cinq questions récurrentes, un cache sémantique correctement configuré peut servir ces requêtes en moins de 100 ms au lieu de 2,3 secondes, à coût quasi nul. A résout le problème pour 100 % des requêtes mais avec un gain marginal sur les 45 % qui bénéficieraient du cache. D améliore la latence perçue sans réduire les coûts ni la latence réelle.",
    },
    {
      id: "m6q3",
      question:
        "Laquelle de ces affirmations sur le monitoring d'un système IA en production est FAUSSE ?",
      options: [
        {
          label: "A",
          text: "Le taux d'utilisation dans le temps est un indicateur de satisfaction plus fiable que le taux de plaintes explicites",
        },
        {
          label: "B",
          text: "Les logs d'application standard suffisent pour détecter les dérives qualitatives d'un système IA",
        },
        {
          label: "C",
          text: "Une alerte sur le taux de feedback négatif permet de détecter des problèmes avant qu'ils ne se transforment en incidents formels",
        },
        {
          label: "D",
          text: "L'instrumentation des traces (input, output, chunks retrieval, latence) est indispensable pour diagnostiquer les défaillances en production",
        },
      ],
      correctAnswer: "B",
      explanation:
        "C'est l'affirmation fausse. Les logs d'application capturent les erreurs techniques mais sont aveugles aux dérives qualitatives : un système qui répond en 200 ms avec des réponses factuellement incorrectes ne génère aucune erreur technique. L'observabilité d'un système IA exige une instrumentation spécifique sur la qualité des outputs.",
    },
    {
      id: "m6q4",
      question:
        "Quel est le principal levier pour réduire la latence réelle (et non seulement la latence perçue) d'un système RAG + LLM ?",
      options: [
        {
          label: "A",
          text: "Utiliser le streaming pour distribuer l'affichage des tokens au fur et à mesure de la génération",
        },
        {
          label: "B",
          text: "Augmenter le nombre de chunks récupérés lors du retrieval pour améliorer la qualité du contexte",
        },
        {
          label: "C",
          text: "Contraindre la longueur des réponses générées et optimiser la taille du contexte injecté",
        },
        {
          label: "D",
          text: "Migrer vers un provider offrant une meilleure bande passante réseau",
        },
      ],
      correctAnswer: "C",
      explanation:
        "La génération des tokens domine la latence totale — et cette génération est proportionnelle à la longueur de la réponse. Contrôler la longueur de sortie avec max_tokens et des instructions de format est donc le levier principal. En parallèle, réduire la taille du contexte réduit le TTFT (Time To First Token), qui croît quadratiquement. A améliore la latence perçue, pas la latence réelle.",
    },
    {
      id: "m6q5",
      question:
        "Une ESN livre un assistant IA pour un cabinet de conseil en stratégie. Trois mois après le déploiement, l'adoption stagne à 23 % des consultants. Aucune plainte formelle n'a été remontée. Le système répond correctement sur les tests de recette. Quelle est la démarche la plus pertinente ?",
      options: [
        {
          label: "A",
          text: "Considérer que le taux d'adoption de 23 % est normal pour une solution IA en phase de démarrage et attendre",
        },
        {
          label: "B",
          text: "Ajouter des fonctionnalités pour rendre le système plus attractif, sur la base d'hypothèses de l'équipe projet",
        },
        {
          label: "C",
          text: "Analyser les traces de production (requêtes abandonnées, reformulations, temps de session, feedback implicite) pour identifier les friction points réels avant toute décision",
        },
        {
          label: "D",
          text: "Interroger les 23 % d'utilisateurs actifs pour comprendre ce qui fonctionne et dupliquer leurs usages",
        },
      ],
      correctAnswer: "C",
      explanation:
        "Un taux d'adoption de 23 % avec zéro plainte est le signal classique d'un abandon silencieux. Les 77 % qui n'utilisent pas le système n'ont pas ouvert de ticket : ils ont essayé, ont été déçus, et sont retournés à leurs pratiques habituelles. L'analyse des traces révèle les friction points réels sans biais de survie.",
    },
  ],
}
