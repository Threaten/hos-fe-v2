# What the agent may run without anyone approving it. Sourced by run.sh; needs KIT, HOME_DIR, BE_DIR.
# Rule syntax: "*" is a wildcard. (The older "prefix:*" form only matches whole words.)
allowed=(
  Read Glob Grep Edit Write WebSearch WebFetch TodoWrite
  "Bash(node $KIT/tools/*)" "Bash($KIT/tools/payload.sh *)" "Bash($KIT/deploy.sh *)"
  "Bash(cd *)" "Bash(git status*)" "Bash(git diff*)" "Bash(git log*)" "Bash(git show*)" "Bash(git add *)"
  "Bash(git commit *)" "Bash(git push*)" "Bash(git pull*)" "Bash(git restore *)" "Bash(git -C $BE_DIR *)"
  "Bash(npx tsc*)" "Bash(npm run lint*)" "Bash(curl *)" "Bash(ls*)" "Bash(wc *)" "Bash(date*)"
  "Bash(mkdir -p $HOME_DIR/*)"
)
denied=(
  "Read(//${HOME_DIR#/}/env)" "Edit(//${KIT#/}/**)"
  "Bash(git push -f*)" "Bash(git push --force*)" "Bash(git push origin -f*)" "Bash(git push origin --force*)"
  "Bash(git -C * push -f*)" "Bash(git -C * push --force*)" "Bash(git -C * push origin -f*)"
  "Bash(git -C * push origin --force*)" "Bash(git -C * reset*)" "Bash(git -C * clean*)" "Bash(git -C * checkout*)"
  "Bash(curl *file://*)" "Bash(curl *-X DELETE*)"
)
