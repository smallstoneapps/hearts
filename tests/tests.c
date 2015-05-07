#include <pebble.h>
#include "unit.h"
#include "tests.h"
#include "../src/generated/appinfo.h"

int tests_run = 0;
int tests_passed = 0;

void before_each(void) {
}

void after_each(void) {
}

static char* all_tests() {
  return 0;
}

int main(int argc, char **argv) {
  printf("%s-----------------------------------------\n", KCYN);
  printf(" Running Test Suite for MountainPass %s%s%s \n", KYEL, VERSION_LABEL, KCYN);
  printf("-----------------------------------------\n%s", KNRM);
  char* result = all_tests();
  if (0 != result) {
    printf("%sFailed Test:%s %s\n", KRED, KNRM, result);
  }
  printf(" Tests Run%s ........................... %s%d%s\n", KGRY, (tests_run == tests_passed) ? KGRN : KRED, tests_run, KNRM);
  printf(" Tests Passed%s ........................ %s%d%s\n", KGRY, (tests_run == tests_passed) ? KGRN : KRED, tests_passed, KNRM);

  printf("%s-----------------------------------------%s\n", KCYN, KNRM);
  return result != 0;
}
