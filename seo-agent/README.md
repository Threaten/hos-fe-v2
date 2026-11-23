# House of Senses SEO agent

An autonomous agent that runs on the VPS every night and works on Google visibility for houseofsenses.vn
and every branch site (red-space., blue-bistro., and new branches automatically). It runs Claude Code with
your **Claude Pro/Max subscription**: no API credit. Same toolkit as the Skill & Mix agent; this site's
settings are in `site.conf`, its instructions in `PROMPT.md`.

Each night it measures (Search Console, a page audit of every branch), picks 1–3 improvements (search titles
and descriptions per page, the menu as text from the menu PDF, structured data, alt text, technical fixes),
makes them through the CMS API or as small code commits it pushes and deploys (with rollback), and keeps a
journal plus a to-do list for you. It only uses facts from the CMS, the menu or `facts.md`.

## Install (once, on the VPS)

```bash
cd /path/to/hos-fe-v2      # the frontend folder pm2's hos-fe app runs from
git pull
bash seo-agent/install.sh
```

The CMS account it needs: a role "SEO Agent" with only *Branch settings & website: Edit* and
*Media library: Edit*, given to a user "SEO Agent" at every branch, with "Enable API Key" ticked.

## Day to day (this agent's folder is ~/.seo-agent-hos)

| What | Command |
| --- | --- |
| Set the target keywords | `nano ~/.seo-agent-hos/state/keywords.txt` |
| Add real facts (cuisine, prices, events, ...) | `nano ~/.seo-agent-hos/state/facts.md` |
| Competitors it studies | `nano ~/.seo-agent-hos/state/competitors.txt` |
| What it did | `cat ~/.seo-agent-hos/state/journal.md` |
| Things for you to do | `cat ~/.seo-agent-hos/state/owner-todo.md` |
| Run now | `~/.seo-agent-hos/kit/run.sh` |
| Pause / resume | `touch ~/.seo-agent-hos/PAUSED` / `rm ~/.seo-agent-hos/PAUSED` |
| Change settings | `bash seo-agent/install.sh` again |

It runs at 03:45 Vietnam time; if the Skill & Mix agent is still running it waits, since both share your
Claude Pro usage limit.
