import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, language = 'sw' } = await req.json();

    // Better prompts for Gemma model
    const prompts = {
      sw: `Andika muhtasari mfupi wa maandishi haya kwa Kiswahili:\n\n${text}\n\nMuhtasari:`,
      en: `Write a brief summary of this text in Swahili:\n\n${text}\n\nMuhtasari:`,
    };

    const summarizationPrompt = prompts[language as keyof typeof prompts] || prompts.sw;

    const response = await fetch('http://127.0.0.1:8080/completion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: summarizationPrompt,
        n_predict: 256,
        temperature: 0.3, // Lower for more focused output
        top_p: 0.85,
        top_k: 40,
        repeat_penalty: 1.15,
        stop: ["\n\nExplanation:", "\n\n", "Explanation:", "\nNote:"], // Stop before explanations
        stream: false,
      }),
    });

    const data = await response.json();
    
    console.log('Llama.cpp response:', {
      content: data.content?.substring(0, 200),
      content_length: data.content?.length,
      tokens_predicted: data.tokens_predicted,
      stop_type: data.stop_type,
      stopping_word: data.stopping_word
    });
    
    let summaryText = (data.content || '').trim();
    
    // Remove "Muhtasari:" prefix if the model includes it
    summaryText = summaryText.replace(/^Muhtasari:\s*/i, '');
    
    // Remove explanation parts if they slipped through
    summaryText = summaryText.split(/\n\n(Explanation|Note):/i)[0].trim();
    
    if (!summaryText || summaryText.length < 10) {
      console.error('Empty or too short summary - Model details:', {
        model: data.model,
        stop_type: data.stop_type,
        tokens_predicted: data.tokens_predicted,
        prompt_length: summarizationPrompt.length,
        text_length: text.length
      });
      
      // Retry with simpler prompt
      const retryResponse = await fetch('http://127.0.0.1:8080/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Fupisha: ${text}\n\nMuhtasari:`,
          n_predict: 200,
          temperature: 0.5,
          top_p: 0.9,
          stop: ["\n\n"],
          stream: false,
        }),
      });
      
      const retryData = await retryResponse.json();
      summaryText = (retryData.content || '').trim().replace(/^Muhtasari:\s*/i, '');
      
      console.log('Retry response:', {
        content: summaryText.substring(0, 200),
        tokens_predicted: retryData.tokens_predicted
      });
    }
    
    // Final check
    if (!summaryText || summaryText.length < 10) {
      return NextResponse.json({ 
        summary: `Samahani, muhtasari haukuweza kutengenezwa. Maandishi ya asili: ${text.substring(0, 300)}...`
      });
    }
    
    return NextResponse.json({ summary: summaryText });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}