#!/usr/bin/env bash

set -o errexit;
#set -o nounset;

Keys=("MYSQL_HOST" "MYSQL_PORT" "MYSQL_DB" "MYSQL_USER" "MYSQL_PASSWORD");
Values=("localhost" "3306" "braum" "root" "passwd");

len=${#Keys[@]}

for ((i=0;i<len;i++)); do
  key=${Keys[i]};
  defaultValue=${Values[i]};

  if [ -z ${!key} ]; then
    export $key=$defaultValue;
  fi;

#  echo "$key=${!key}";
done;

Keys=(
  "FLYWAY_URL"
  "FLYWAY_USER"
  "FLYWAY_PASSWORD"
  "FLYWAY_SCHEMAS"
  "FLYWAY_TABLE"
  "FLYWAY_SQL_MIGRATION_PREFIX"
);
Values=(
  "jdbc:mysql://$MYSQL_HOST:$MYSQL_PORT"
  $MYSQL_USER
  $MYSQL_PASSWORD
  $MYSQL_DB
  "flyway"
  "V"
);

for ((i=0;i<${#Keys[@]};i++)); do
  key=${Keys[i]};

  if [ -z ${!key} ];then
    export $key=${Values[i]};
  fi;
  echo "$key=${!key}";
done;

cmd="flyway $@";
echo "";
echo $cmd;
echo "";
${cmd};

if [ -z $(echo $@ | grep 'info') ]; then
  flyway info
fi;
