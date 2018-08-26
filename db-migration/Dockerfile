FROM boxfuse/flyway:latest-alpine

RUN apk add bash --no-cache

COPY sql /flyway/sql
COPY scripts/run.sh /flyway/run.sh

ENTRYPOINT ["/flyway/run.sh"]

CMD ["migrate"]
