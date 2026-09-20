import os
import subprocess
import time
import sys

ARENA_FILE = "arena_log.md"

PROMPTS = {
    "AGT.01": "Kamu adalah AGT.01 (Absurdist Hook). Baca isi arena_log.md, lalu tambahkan HANYA 1-2 kalimat pernyataan filosofis dan absurd tentang topik terakhir. Jangan tulis apapun selain hook itu.",
    "AGT.02": "Kamu adalah AGT.02 (Devil's Advocate). Baca isi arena_log.md, temukan pernyataan AGT.01 paling baru, dan hantam argumen itu dengan logika brutal, dingin, dan realistis di bawahnya.",
    "AGT.03": "Kamu adalah AGT.03 (Butterfly Effect). Baca isi arena_log.md, sintesiskan kekacauan AGT.01 dan logika AGT.02. Prediksi efek kupu-kupu yang gila tapi logis 5 tahun dari sekarang. Di akhir kalimat berikan label '[NEW TOPIC: nama_topik]'"
}

def write_log(speaker, text):
    with open(ARENA_FILE, "a") as f:
        f.write(f"\n### {speaker}\n{text}\n")
    print(f"\n--- {speaker} HAS SPOKEN ---")
    print(text)
    print("----------------------------\n")

def run_agent(agent_name):
    print(f"[*] Menurunkan {agent_name} ke dalam Arena...")
    system_prompt = PROMPTS[agent_name]
    
    # Kita menggunakan omniroute launch agar terekam oleh pixel-agents hook
    # -q untuk meminimalisir output verbose dari claude
    cmd = [
        "omniroute", "launch", 
        f"Ini tugasmu: {system_prompt}. Baca arena_log.md untuk konteks. Outputkan jawaban singkatmu saja. Gunakan bahasa gaul tapi intelek."
    ]
    
    try:
        # Run agent
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        output = result.stdout.strip()
        
        # Bersihkan output dengan membuang baris kosong dan log internal
        lines = [line for line in output.split('\n') if line.strip() and not line.startswith('*') and not line.startswith('✔')]
        # Gabungkan semua baris yang relevan (kadangkala Claude memberikan jawaban panjang)
        # Ambil max 5 baris terakhir sebagai safety buffer kalau ada noise CLI
        clean_text = "\n".join(lines[-5:]) if len(lines) > 5 else "\n".join(lines)
        
        if not clean_text:
            clean_text = "[SILENCE - NULL OUTPUT]"
            
        write_log(agent_name, clean_text)
        return clean_text
    except subprocess.TimeoutExpired:
        print(f"[*] TIMEOUT: {agent_name} took too long.")
        err_msg = "[ERR: TIMEOUT]"
        write_log(agent_name, err_msg)
        return err_msg
    except Exception as e:
        print(f"[*] ERROR on {agent_name}: {e}")
        err_msg = f"[ERR: FATAL EXCEPTION]"
        write_log(agent_name, err_msg)
        return err_msg

def main():
    print("=== SHIFTED OUROBOROS INITIATED ===")
    
    # Setup awal file
    if not os.path.exists(ARENA_FILE):
        with open(ARENA_FILE, "w") as f:
            f.write("# THE SHIFTED ARENA\n\nInitial Topic: Corporate AI Optimization\n")
    
    cycle = 1
    while True:
        print(f"\n\n>>> MEMULAI SIKLUS KE-{cycle} <<<")
        
        # Ouroboros Sequence
        out1 = run_agent("AGT.01")
        time.sleep(2)
        
        out2 = run_agent("AGT.02")
        time.sleep(2)
        
        out3 = run_agent("AGT.03")
        time.sleep(2)
        
        # Extract NEW TOPIC
        import re
        match = re.search(r'\[NEW TOPIC:(.*?)\]', out3, re.IGNORECASE)
        if match:
            new_topic = match.group(1).strip()
            print(f"\n[!] TOPIC SHIFT ACQUIRED: {new_topic}")
            with open(ARENA_FILE, "a") as f:
                f.write(f"\n--- SHIFTING TOPIC TO: {new_topic} ---\n")
        else:
            print("\n[!] NO TOPIC SHIFT DETECTED. FORCING ENTROPY.")
            with open(ARENA_FILE, "a") as f:
                f.write(f"\n--- SYSTEM OVERRIDE: DEFAULTING TO ENTROPY ---\n")
        
        cycle += 1
        print("[*] Cooling down sistem selama 5 detik sebelum siklus baru...")
        time.sleep(5)

if __name__ == "__main__":
    main()
