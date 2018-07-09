SHELL=/bin/bash

GIT_REV=$(shell git rev-parse --short HEAD)
GIT_BRANCH=$(shell git rev-parse --abbrev-ref HEAD)

.PHONY: build_ci
build_ci:
	# @echo -e "\033[92m  ---> circleci: fetching  \033[0m"
	# curl -o /usr/local/bin/circleci https://circle-downloads.s3.amazonaws.com/releases/build_agent_wrapper/circleci && chmod +x /usr/local/bin/circleci
	@echo -e "\033[92m  ---> circleci: updating  \033[0m"
	circleci update
	@echo -e "\033[92m  ---> circleci: validating  \033[0m"
	circleci config validate -c .circleci/config.yml
	@echo -e "\033[92m  ---> circleci: running  \033[0m"
	circleci build \
		--job "build" \
		--skip-checkout=false \
		--repo-url="/fake-remote" \
		--volume="$(shell pwd)":"/fake-remote" \
		--branch="$(shell git rev-parse --abbrev-ref HEAD)"
	circleci build \
		--job "image" \
		--skip-checkout=false \
		--repo-url="/fake-remote" \
		--volume="$(shell pwd)":"/fake-remote" \
		--branch="$(shell git rev-parse --abbrev-ref HEAD)"

.PHONY: image_build
image_build:
	@echo -e "\033[92m  ---> image: building  \033[0m"
	docker-compose build
	COMPOSE_BUILD_TAG=$(GIT_REV) docker-compose build

.PHONY: image_push
image_push:
	@echo -e "\033[92m  ---> image: pushing  \033[0m"
	docker-compose push
	COMPOSE_BUILD_TAG=$(GIT_REV) docker-compose push
