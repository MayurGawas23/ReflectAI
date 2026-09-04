import { Interaction } from '../types';

export function getCuratedJournalSeed(userId: string): Interaction[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return [
    {
      id: `seed_entry_1_${userId}`,
      userId,
      title: 'Gen AI Academy Hackathon Architecture',
      createdAt: now - 2 * 3600 * 1000,
      updatedAt: now - 1 * 3600 * 1000,
      location: {
        lat: 1.2966,
        lng: 103.7764,
        placeName: 'Google Cloud APAC Hub, Tech Sanctuary',
        formattedAddress: 'Marina Bay Financial Centre, Singapore'
      },
      summary: 'Architected ReflectAI for the Hack2skill Gen AI Academy Cohort 3. Integrated multi-turn Gemini 2.5 Flash dialogue with a resilient server-side fallback ladder on Google Cloud Run, backed by zero-trust Firestore security rules and cryptographic notification dispatches.',
      themes: ['GenAI Academy', 'Cloud Run', 'Architecture', 'Firebase Security', 'Mindfulness'],
      actionItems: [
        'Verify zero-trust Firestore rules to prevent admin cross-read of user reflections',
        'Test HMAC-SHA256 signature verification on outbound Slack & Discord dispatch payloads',
        'Record demo walkthrough showcasing Google Maps sanctuary geolocation grounding'
      ],
      messages: [
        {
          role: 'user',
          text: 'We are completing the final deployment of ReflectAI for Hack2skill Gen AI Academy Cohort 3! I want to ensure our architecture balances thoughtful cognitive reframing with zero-trust privacy.',
          timestamp: now - 2 * 3600 * 1000
        },
        {
          role: 'model',
          text: 'Congratulations on reaching the final cohort milestone! Looking at your system topology, the design exhibits strong cognitive separation:\n\n1. **Zero-Trust Boundary**: Your personal reflections are stored under `/users/{userId}/interactions/*` with strict Firestore security rules—even administrators cannot read raw user entries.\n2. **Resilient AI Pipeline**: The Gemini 2.5 Flash multi-model ladder on Cloud Run ensures high-throughput conversational coaching without exposing credentials to client bundles.\n3. **Action-Oriented Closure**: Synthesizing discussions into concrete next steps and HMAC-signed webhook dispatches bridges reflective thinking directly into real-world follow-through.',
          timestamp: now - 110 * 60 * 1000
        },
        {
          role: 'user',
          text: 'How should we present the sanctuary location feature to show environmental mindfulness?',
          timestamp: now - 90 * 60 * 1000
        },
        {
          role: 'model',
          text: 'Framing location through physical ambiance creates genuine contextual grounding. When you journal from a designated tech campus or peaceful park sanctuary, Gemini can calibrate tone—encouraging stillness in nature or structured execution in high-energy spaces.',
          timestamp: now - 85 * 60 * 1000
        }
      ]
    },
    {
      id: `seed_entry_2_${userId}`,
      userId,
      title: 'Morning Socratic Clarity at Central Park',
      createdAt: now - dayMs,
      updatedAt: now - dayMs + 3600 * 1000,
      location: {
        lat: 40.785091,
        lng: -73.968285,
        placeName: 'Ramble Forest & Meadow Sanctuary',
        formattedAddress: 'Central Park, New York, NY'
      },
      summary: 'Morning cognitive debrief exploring prioritization under tight deadlines. Re-centered focus on high-impact milestones and eliminated cognitive overhead through Stoic mental models.',
      themes: ['Stoicism', 'Prioritization', 'Deep Work', 'Mental Clarity'],
      actionItems: [
        'Timebox deep work blocks into 90-minute uninterrupted sprints',
        'Conduct a 5-minute evening debrief to review energy expenditure'
      ],
      messages: [
        {
          role: 'user',
          text: 'Sitting in the park before starting the day. I have 10 different tasks competing for attention and feel a slight sense of urgency pulling me in every direction.',
          timestamp: now - dayMs
        },
        {
          role: 'model',
          text: 'Take a deep breath and take in the green expanse around you. Let’s apply Epictetus’s dichotomy of control:\n\n- Which of these 10 tasks directly determines the foundational outcome of your project?\n- Which ones are merely reactive noise masquerading as urgency?\n\nIf you could only complete ONE milestone today before the sun sets, which single item creates the greatest leverage?',
          timestamp: now - dayMs + 10 * 60 * 1000
        },
        {
          role: 'user',
          text: 'Solidifying the Cloud Run deployment and testing the webhook delivery pipeline. If that works reliably, everything else falls into place cleanly.',
          timestamp: now - dayMs + 20 * 60 * 1000
        },
        {
          role: 'model',
          text: 'There is your focus. Give yourself permission to defer the other nine until that primary foundation is verified. Quality emerges from focused attention, not scattered activity.',
          timestamp: now - dayMs + 25 * 60 * 1000
        }
      ]
    },
    {
      id: `seed_entry_3_${userId}`,
      userId,
      title: 'Quiet Library Strategy & Evening Debrief',
      createdAt: now - 2 * dayMs,
      updatedAt: now - 2 * dayMs + 45 * 60 * 1000,
      location: {
        lat: 37.7749,
        lng: -122.4194,
        placeName: 'City Library Reading Sanctuary',
        formattedAddress: 'Civic Center, San Francisco, CA'
      },
      summary: 'Evening reflection session examining sustainable pacing, architectural modularity, and balancing speed of development with security rigor.',
      themes: ['Productivity', 'Self-Reflection', 'System Design'],
      actionItems: [
        'Review Cloud Run cold start latency metrics in telemetry console',
        'Schedule a 30-minute offline reading block each morning'
      ],
      messages: [
        {
          role: 'user',
          text: 'Reviewing the day after a quiet session at Katraj Ghat. We hit our core technical deliverables, but I want to reflect on whether my pace is sustainable long-term.',
          timestamp: now - 2 * dayMs
        },
        {
          role: 'model',
          text: 'Reflecting on sustainability is the mark of a seasoned practitioner. Sustainable speed is not about sprinting perpetually; it is about establishing smooth, repeatable cadences where building feels deliberate rather than frantic.\n\nYou laid down clean abstractions, verified security boundaries, and documented your flow. Acknowledge the progress made today and allow yourself complete rest this evening.',
          timestamp: now - 2 * dayMs + 30 * 60 * 1000
        }
      ]
    }
  ];
}
