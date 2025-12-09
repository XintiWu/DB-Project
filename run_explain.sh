#!/bin/bash

# 執行 EXPLAIN ANALYZE 測試腳本
# 使用 postgres 使用者，port 5433

psql -h localhost -p 5433 -U postgres -d disaster_platform -f explain_tests.sql


