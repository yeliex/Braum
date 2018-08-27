-- ****************** SqlDBM: MySQL ******************;
-- ***************************************************;

DROP TABLE IF EXISTS `braum`.`service`;
DROP TABLE IF EXISTS `braum`.`span`;
DROP TABLE IF EXISTS `braum`.`action`;
DROP TABLE IF EXISTS `braum`.`annotation`;
DROP TABLE IF EXISTS `braum`.`error`;

-- ************************************** `braum`.`service`

CREATE TABLE `braum`.`service`
(
 `id`         INT unsigned NOT NULL AUTO_INCREMENT ,
 `name`       VARCHAR(255) NOT NULL ,
 `host`       VARCHAR(255) NOT NULL ,
 `ipv4`       VARCHAR(15) ,
 `ipv6`       VARCHAR(39) ,
 `port`       SMALLINT(6) ,
 `status`     TINYINT(1) NOT NULL DEFAULT 0 ,
 `utc_create` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
 `utc_start`  TIMESTAMP COMMENT '最近一次启动时间, 记录重启次数' ,

PRIMARY KEY (`id`),
KEY `idx_n_h` (`host`, `name`)
);





-- ************************************** `braum`.`span`

CREATE TABLE `braum`.`span`
(
 `id`         BIGINT(20) unsigned NOT NULL ,
 `trace_id`   BIGINT(64) unsigned NOT NULL ,
 `parent_id`  BIGINT(20) unsigned NOT NULL ,
 `utc_create` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
 `duration`   TIMESTAMP COMMENT '请求持续时间,方便快速查询' ,

PRIMARY KEY (`id`, `trace_id`),
UNIQUE KEY `uk_i` (`id`),
UNIQUE KEY `uk_i_t_p` (`id`, `trace_id`, `parent_id`),
UNIQUE KEY `uk_i_p` (`id`, `parent_id`)
);





-- ************************************** `braum`.`action`

CREATE TABLE `braum`.`action`
(
 `id`         BIGINT(20) unsigned NOT NULL ,
 `span_id`    BIGINT(20) unsigned NOT NULL ,
 `trace_id`   BIGINT(64) unsigned NOT NULL ,
 `service_id` INT unsigned ,
 `type`       VARCHAR(12) NOT NULL ,
 `utc_create` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,

PRIMARY KEY (`id`),
KEY `idx_svc` (`service_id`),
CONSTRAINT `FK_187` FOREIGN KEY `idx_svc` (`service_id`) REFERENCES `braum`.`service` (`id`),
KEY `idx_sid_tid` (`span_id`, `trace_id`),
CONSTRAINT `FK_225` FOREIGN KEY `idx_sid_tid` (`span_id`, `trace_id`) REFERENCES `braum`.`span` (`id`, `trace_id`),
KEY `idx_tid` (`trace_id`),
KEY `idx_t` (`type`),
KEY `idx_sid_t` (`span_id`, `type`),
KEY `idx_svc_t` (`service_id`, `type`),
KEY `idx_tid_t` (`trace_id`, `type`),
KEY `idx_sid` (`span_id`)
) COMMENT='action中 会记录一次span的多次操作,比如一次请求的 cs/sr/sc/cr, 所以不可少\n\nannotation中可能有各种奇奇怪怪的数据, 不适合记录频繁查询影响性能';





-- ************************************** `braum`.`annotation`

CREATE TABLE `braum`.`annotation`
(
 `action_id` BIGINT(20) unsigned NOT NULL ,
 `span_id`   BIGINT(20) unsigned NOT NULL ,
 `trace_id`  BIGINT(64) unsigned NOT NULL ,
 `key`       VARBINARY(255) NOT NULL ,
 `value`     LONGTEXT ,

KEY `idx_a_s_t_k` (`key`, `action_id`, `span_id`, `trace_id`),
KEY `idx_a_k` (`key`, `action_id`),
KEY `idx_s_k` (`key`, `span_id`),
KEY `idx_s_a_k` (`key`, `span_id`, `action_id`),
KEY `idx_s_t` (`span_id`, `trace_id`),
CONSTRAINT `FK_292` FOREIGN KEY `idx_s_t` (`span_id`, `trace_id`) REFERENCES `braum`.`span` (`id`, `trace_id`),
KEY `idx_a` (`action_id`),
CONSTRAINT `FK_297` FOREIGN KEY `idx_a` (`action_id`) REFERENCES `braum`.`action` (`id`),
KEY `idx_t_k` (`trace_id`, `key`)
);





-- ************************************** `braum`.`error`

CREATE TABLE `braum`.`error`
(
 `id`         BIGINT(20) NOT NULL ,
 `span_id`    BIGINT(20) unsigned NOT NULL ,
 `action_id`  BIGINT(20) unsigned NOT NULL ,
 `trace_id`   BIGINT(64) unsigned NOT NULL ,
 `name`       VARBINARY(256) NOT NULL DEFAULT 'Error' ,
 `message`    TEXT NOT NULL ,
 `stack`      BLOB ,
 `meta`       BLOB COMMENT '元数据' ,
 `utc_create` TIMESTAMP NOT NULL ,

PRIMARY KEY (`id`),
KEY `idx_s_t` (`span_id`, `trace_id`),
CONSTRAINT `FK_27` FOREIGN KEY `idx_s_t` (`span_id`, `trace_id`) REFERENCES `braum`.`span` (`id`, `trace_id`),
KEY `idx_a` (`action_id`),
CONSTRAINT `FK_205` FOREIGN KEY `idx_a` (`action_id`) REFERENCES `braum`.`action` (`id`),
KEY `idx_a_s_t` (`action_id`, `span_id`, `trace_id`)
);

